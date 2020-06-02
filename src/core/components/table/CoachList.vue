<template>
  <div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Utilisateurs</p>
      <q-card>
        <ni-responsive-table :data="users" :columns="usersColumns" :pagination.sync="usersPagination"
          :loading="usersLoading">
          <template v-slot:header="{ props }">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style"
                :class="[{ 'actions':col.name === 'actions' }]">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <q-btn flat dense round small color="grey" icon="edit" @click="openUserEditionModal(props.row)" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <q-btn no-caps flat color="primary" icon="add" label="Ajouter un utilisateur"
            @click="userCreationModal = true" :disable="usersLoading" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- User creation modal -->
    <ni-modal v-model="userCreationModal" @hide="resetUserCreationForm" @show="openUserCreationModal">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">utilisateur</span>
      </template>
      <ni-input :disable="!firstStep" in-modal v-model="newUser.local.email" :error="$v.newUser.local.email.$error"
        caption="Email" @blur="$v.newUser.local.email.$touch" :error-label="emailError($v.newUser)" required-field />
      <ni-select :disable="!firstStep" in-modal caption="Role" :options="roleOptions" v-model="newUser.role"
        :error="$v.newUser.role.$error" @blur="$v.newUser.role.$touch" :last="firstStep" required-field />
      <template v-if="!firstStep">
        <ni-input in-modal v-model="newUser.identity.firstname" caption="Prénom" />
        <ni-input in-modal v-model="newUser.identity.lastname" :error="$v.newUser.identity.lastname.$error"
          caption="Nom" @blur="$v.newUser.identity.lastname.$touch" required-field />
        <ni-input in-modal v-model.trim="newUser.contact.phone" :error="$v.newUser.contact.phone.$error"
          caption="Téléphone" @blur="$v.newUser.contact.phone.$touch" :error-label="phoneNbrError($v.newUser)" />
      </template>
      <template slot="footer">
        <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" icon-right="add" color="primary"
          :loading="loading" @click="nextStep" />
        <q-btn v-else no-caps class="full-width modal-btn" label="Ajouter un utilisateur" icon-right="add"
          color="primary" :loading="loading" @click="createUser" />
      </template>
    </ni-modal>

    <!-- User edition modal -->
    <ni-modal v-model="userEditionModal" @hide="resetUserEditionForm">
      <template slot="title">
        Éditer un <span class="text-weight-bold">utilisateur</span>
      </template>
      <ni-input in-modal v-model="selectedUser.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model="selectedUser.identity.lastname" :error="$v.selectedUser.identity.lastname.$error"
        caption="Nom" @blur="$v.selectedUser.identity.lastname.$touch" required-field />
      <ni-input in-modal v-model="selectedUser.local.email" :error="$v.selectedUser.local.email.$error" caption="Email"
        @blur="$v.selectedUser.local.email.$touch" :error-label="emailError($v.selectedUser)" required-field />
      <ni-input in-modal v-model.trim="selectedUser.contact.phone" :error="$v.selectedUser.contact.phone.$error"
        caption="Téléphone" @blur="$v.selectedUser.contact.phone.$touch"
        :error-label="phoneNbrError($v.selectedUser)" />
      <ni-select in-modal caption="Role" :options="roleOptions" v-model="selectedUser.role"
        :error="$v.selectedUser.role.$error" @blur="$v.selectedUser.role.$touch" last required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Éditer un utilisateur" icon-right="check" color="primary"
          :loading="loading" @click="updateUser" :disable="$v.selectedUser.$invalid" />
      </template>
    </ni-modal>
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
import Users from '@api/Users';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { formatPhone, clear, removeEmptyProps } from '@helpers/utils';
import { defineAbilitiesFor } from '@helpers/ability';
import { ROLES_TRANSLATION, CLIENT_ADMIN, COACH } from '@data/constants';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';

export default {
  name: 'CoachList',
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-responsive-table': ResponsiveTable,
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
          format: (value) => formatPhone(value),
        },
        {
          name: 'role',
          label: 'Role',
          align: 'left',
          field: row => get(row, 'role.client.name') || '',
          format: value => value ? ROLES_TRANSLATION[value] : '',
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
      const ability = defineAbilitiesFor(
        get(this.loggedUser, 'role.client.name'),
        get(this.loggedUser, 'role.vendor.name'),
        this.company
      );
      return ability.can('set', 'user_company');
    },
  },
  methods: {
    formatUserPayload (user) {
      const userPayload = removeEmptyProps(user);
      if (this.canSetUserCompany) userPayload.company = this.company._id;
      return userPayload;
    },
    async nextStep () {
      try {
        this.loading = true;
        this.$v.newUser.local.email.$touch();
        if (this.$v.newUser.local.email.$error || !this.newUser.local.email) return NotifyWarning('Champs invalides');
        const userInfo = await Users.exists({ email: this.newUser.local.email });
        const user = userInfo.user;

        const sameOrNoCompany = !user.company || user.company === this.company._id;
        if (userInfo.exists && !sameOrNoCompany) return NotifyNegative('Impossible de créer cet utilisateur');
        else if (userInfo.exists && get(userInfo, 'user.role.client')) return NotifyNegative('Utilisateur déjà existant');
        else if (userInfo.exists) {
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
      try {
        this.loading = true;
        this.$v.newUser.$touch();
        if (this.$v.newUser.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Users.create(this.formatUserPayload(this.newUser));
        this.userCreationModal = false;
        this.getUsers();
        NotifyPositive('Utilisateur enregistré.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'utilisateur.');
      } finally {
        this.loading = false;
      }
    },
    resetUserCreationForm () {
      this.firstStep = true;
      this.newUser = Object.assign({}, clear(this.newUser));
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
      return pickBy(
        pick(user, ['identity.firstname', 'identity.lastname', 'local.email', 'role', 'contact.phone'])
      );
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
        this.users = [];
      } finally {
        this.usersLoading = false;
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
@media screen and (min-width: 767px)
  .actions
    width: 75px
</style>
