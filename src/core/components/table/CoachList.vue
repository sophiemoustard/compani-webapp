<template>
  <div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Utilisateurs</p>
      <q-card>
        <ni-responsive-table :data="users" :columns="usersColumns" :pagination.sync="usersPagination"
          :loading="usersLoading">
          <template #header="{ props }">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style"
                :class="[{ 'actions':col.name === 'actions' }]">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <ni-button icon="edit" @click="openUserEditionModal(props.row)" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <ni-button color="primary" icon="add" label="Ajouter un utilisateur" @click="userCreationModal = true"
            :disable="usersLoading" />
        </q-card-actions>
      </q-card>
    </div>

    <user-creation-modal v-model="userCreationModal" :new-user.sync="newUser" :email-error="emailError($v.newUser)"
      :first-step="firstStep" :loading="loading" :phone-nbr-error="phoneNbrError($v.newUser)"
      :validations="$v.newUser" :role-options="roleOptions" @hide="resetUserCreationForm" @show="openUserCreationModal"
      @submit="createUser" @go-to-next-step="nextStep" />

    <user-edition-modal v-model="userEditionModal" :phone-nbr-error="phoneNbrError($v.newUser)" :loading="loading"
      :validations="$v.selectedUser" :email-error="emailError($v.selectedUser)" :selected-user.sync="selectedUser"
      :role-options="roleOptions" @hide="resetUserEditionForm" @submit="updateUser" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required, email } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import cloneDeep from 'lodash/cloneDeep';
import Roles from '@api/Roles';
import Email from '@api/Email';
import Users from '@api/Users';
import Button from '@components/Button';
import ResponsiveTable from '@components/table/ResponsiveTable';
import UserCreationModal from '@components/table/UserCreationModal';
import UserEditionModal from '@components/table/UserEditionModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { formatPhone, clear, removeEmptyProps, formatPhoneForPayload } from '@helpers/utils';
import { defineAbilitiesFor } from '@helpers/ability';
import { ROLES_TRANSLATION, CLIENT_ADMIN, COACH } from '@data/constants';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';

export default {
  name: 'CoachList',
  components: {
    'ni-button': Button,
    'ni-responsive-table': ResponsiveTable,
    'user-creation-modal': UserCreationModal,
    'user-edition-modal': UserEditionModal,
  },
  props: {
    company: { type: Object, default: () => ({}) },
  },
  mixins: [userMixin],
  data () {
    return {
      loading: false,
      usersLoading: false,
      userCreationModal: false,
      userEditionModal: false,
      firstStep: true,
      usersColumns: [
        { name: 'firstname', label: 'Prénom', align: 'left', field: row => get(row, 'identity.firstname') || '' },
        { name: 'lastname', label: 'Nom', align: 'left', field: row => get(row, 'identity.lastname') || '' },
        { name: 'email', label: 'Email', align: 'left', field: row => get(row, 'local.email') || '' },
        {
          name: 'phone',
          label: 'Téléphone',
          align: 'left',
          field: row => get(row, 'contact.phone') || '',
          format: value => formatPhone(value),
        },
        {
          name: 'role',
          label: 'Role',
          align: 'left',
          field: row => get(row, 'role.client.name') || '',
          format: value => (value ? ROLES_TRANSLATION[value] : ''),
        },
        { name: 'actions', label: '', align: 'center' },
      ],
      usersPagination: {
        rowsPerPage: 0,
        sortBy: 'lastname',
      },
      newUser: {
        identity: { firstname: '', lastname: '' },
        contact: { phone: '' },
        role: '',
        local: { email: '' },
        company: '',
      },
      userValidations: {
        identity: { lastname: { required } },
        local: { email: { required, email } },
        contact: { phone: { frPhoneNumber } },
        role: { required },
      },
      selectedUser: {
        identity: {},
        local: {},
        contact: {},
      },
      roles: [],
      users: [],
    };
  },
  validations () {
    return {
      newUser: this.userValidations,
      selectedUser: this.userValidations,
    };
  },
  async created () {
    await this.getUsers();
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    roleOptions () {
      return this.roles.map(role => ({ label: ROLES_TRANSLATION[role.name], value: role._id }));
    },
    canSetUserCompany () {
      const ability = defineAbilitiesFor(pick(this.loggedUser, ['role', 'company']));

      return ability.can('set', 'user_company');
    },
  },
  methods: {
    formatUserPayload (user) {
      const userPayload = removeEmptyProps(user);
      if (this.canSetUserCompany) userPayload.company = this.company._id;
      if (get(user, 'contact.phone')) userPayload.contact.phone = formatPhoneForPayload(user.contact.phone);
      return userPayload;
    },
    async nextStep () {
      try {
        this.loading = true;
        this.$v.newUser.local.email.$touch();
        if (this.$v.newUser.local.email.$error || !this.newUser.local.email) return NotifyWarning('Champs invalides');
        const userInfo = await Users.exists({ email: this.newUser.local.email });
        const { user } = userInfo;

        const sameOrNoCompany = !user.company || user.company === this.company._id;
        if (userInfo.exists && !sameOrNoCompany) {
          return NotifyNegative('Cet utilisateur n\'est pas relié à cette structure');
        }
        if (userInfo.exists && get(userInfo, 'user.role.client')) return NotifyNegative('Utilisateur déjà existant');
        if (userInfo.exists) {
          await Users.updateById(userInfo.user._id, { role: this.newUser.role, company: this.company._id });
          NotifyPositive('Coach créé');
          await this.getUsers();
          this.userCreationModal = false;
        } else this.firstStep = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du coach');
      } finally {
        this.loading = false;
      }
    },
    async createUser () {
      let newUser;
      try {
        this.loading = true;
        this.$v.newUser.$touch();
        if (this.$v.newUser.$error) return NotifyWarning('Champ(s) invalide(s)');

        newUser = await Users.create(this.formatUserPayload(this.newUser));
        NotifyPositive('Utilisateur enregistré.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'utilisateur.');
      } finally {
        this.loading = false;
      }

      if (!get(newUser, 'company.subscriptions.erp')) {
        try {
          const userRole = this.roles.find(role => role._id === this.newUser.role);
          if (!get(userRole, 'name')) return NotifyNegative('Problème lors de l\'envoi du mail');
          await Email.sendWelcome({ email: this.newUser.local.email, type: get(userRole, 'name') });
          NotifyPositive('Email envoyé.');
        } catch (e) {
          console.error(e);
          NotifyNegative('Erreur lors de l\'envoi du mail.');
          this.loading = false;
          this.userCreationModal = false;
        }
      }

      this.loading = false;
      this.userCreationModal = false;
      this.getUsers();
    },
    resetUserCreationForm () {
      this.firstStep = true;
      this.newUser = { ...clear(this.newUser) };
      this.$v.newUser.$reset();
    },
    async getRoles () {
      try {
        this.roles = await Roles.list({ name: [CLIENT_ADMIN, COACH] });
      } catch (e) {
        console.error(e);
        this.roles = [];
      }
    },
    async openUserCreationModal () {
      if (!this.roles.length) await this.getRoles();
      const coachRole = this.roles.find(role => role.name === COACH);
      if (coachRole) this.newUser.role = coachRole._id;
    },
    async openUserEditionModal (user) {
      if (!this.roles.length) await this.getRoles();

      this.selectedUser = {
        ...this.selectedUser,
        role: user.role.client._id,
        ...pick(cloneDeep(user), ['_id', 'identity.firstname', 'identity.lastname', 'local.email', 'contact.phone']),
      };
      this.userEditionModal = true;
    },
    resetUserEditionForm () {
      this.$v.selectedUser.$reset();
      this.selectedUser = { identity: {}, local: {}, contact: {} };
    },
    formatUpdatedUserPayload (user) {
      const userPayload = pickBy(
        pick(user, ['identity.firstname', 'identity.lastname', 'local.email', 'role', 'contact.phone'])
      );
      if (get(user, 'contact.phone')) userPayload.contact.phone = formatPhoneForPayload(user.contact.phone);
      return userPayload;
    },
    async updateUser () {
      try {
        this.loading = true;
        this.$v.selectedUser.$touch();
        if (this.$v.selectedUser.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Users.updateById(this.selectedUser._id, this.formatUpdatedUserPayload(this.selectedUser));
        this.userEditionModal = false;
        this.getUsers();
        NotifyPositive('Utilisateur modifié.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'utilisateur.');
      } finally {
        this.loading = false;
      }
    },
    async getUsers () {
      try {
        this.usersLoading = true;
        this.users = await Users.list({ role: [CLIENT_ADMIN, COACH], company: this.company._id });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des utilisateurs');
        this.users = [];
      } finally {
        this.usersLoading = false;
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
@media screen and (min-width: 767px)
  .actions
    width: 75px
</style>
