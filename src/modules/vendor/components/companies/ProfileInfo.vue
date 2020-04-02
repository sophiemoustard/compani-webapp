<template>
  <div v-if="company">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Nom" v-model.trim="company.name" @focus="saveTmp('name')" @blur="updateCompany('name')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Utilisateurs</p>
      <q-card>
        <ni-responsive-table :data="users" :columns="usersColumns" :pagination.sync="usersPagination"
          :loading="usersLoading">
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <div class="row no-wrap table-actions">
                      <q-icon color="grey" name="edit" @click.native="openUserEditionModal(props.row)" />
                      <q-icon color="grey" name="delete" @click.native="validateUserDeletion(col.value)" />
                    </div>
                  </div>
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

    <ni-modal v-model="userCreationModal" @hide="resetUserCreationForm" @show="openUserCreationModal">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">utilisateur</span>
      </template>
      <ni-input in-modal v-model="newUser.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model="newUser.identity.lastname" :error="$v.newUser.identity.lastname.$error" caption="Nom"
        @blur="$v.newUser.identity.lastname.$touch" required-field />
      <ni-input in-modal v-model="newUser.local.email" :error="$v.newUser.local.email.$error" caption="Email"
        @blur="$v.newUser.local.email.$touch" :error-label="emailError($v.newUser)" required-field />
      <ni-input in-modal v-model.trim="newUser.contact.phone" :error="$v.newUser.contact.phone.$error"
        caption="Téléphone" @blur="$v.newUser.contact.phone.$touch" :error-label="phoneNbrError($v.newUser)" />
      <ni-select in-modal caption="Role" :options="roleOptions" v-model="newUser.role" :error="$v.newUser.role.$error"
        @blur="$v.newUser.role.$touch" last required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un utilisateur" icon-right="add" color="primary"
          :loading="loading" @click="createUser" :disable="$v.newUser.$invalid" />
      </template>
    </ni-modal>

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
import { mapGetters } from 'vuex';
import { required, email } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import cloneDeep from 'lodash/cloneDeep';
import Companies from '@api/Companies';
import Users from '@api/Users';
import Roles from '@api/Roles';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { CLIENT_ADMIN, COACH, ROLES_TRANSLATION } from '@data/constants';
import { formatPhone, clear, removeEmptyProps } from '@helpers/utils';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { userMixin } from '@mixins/userMixin';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-responsive-table': ResponsiveTable,
  },
  mixins: [userMixin],
  data () {
    return {
      loading: false,
      usersLoading: false,
      userCreationModal: false,
      userEditionModal: false,
      users: [],
      usersColumns: [
        {
          name: 'firstname',
          label: 'Prénom',
          align: 'left',
          field: row => get(row, 'identity.firstname', ''),
        },
        {
          name: 'lastname',
          label: 'Nom',
          align: 'left',
          field: row => get(row, 'identity.lastname', ''),
        },
        {
          name: 'email',
          label: 'Email',
          align: 'left',
          field: row => get(row, 'local.email', ''),
        },
        {
          name: 'phone',
          label: 'Téléphone',
          align: 'left',
          field: row => get(row, 'contact.phone', ''),
          format: (value) => formatPhone(value),
        },
        {
          name: 'role',
          label: 'Role',
          align: 'left',
          field: row => get(row, 'role.client.name', ''),
          format: value => value ? ROLES_TRANSLATION[value] : '',
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: '_id',
        },
      ],
      usersPagination: {
        rowsPerPage: 0,
        sortBy: 'lastname',
      },
      newUser: {
        identity: {
          firstname: '',
          lastname: '',
        },
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
    };
  },
  validations () {
    return {
      company: {
        name: { required },
      },
      newUser: this.userValidations,
      selectedUser: this.userValidations,
    };
  },
  computed: {
    ...mapGetters({ company: 'company/getCompany' }),
    roleOptions () {
      return this.roles.map(role => ({ label: ROLES_TRANSLATION[role.name], value: role._id }));
    },
  },
  async mounted () {
    if (!this.company) await this.refreshCompany();
    await this.getUsers();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.company, path)
    },
    async refreshCompany () {
      try {
        await this.$store.dispatch('company/getCompany', { companyId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    async updateCompany (path) {
      try {
        const value = get(this.company, path);
        if (this.tmpInput === value) return;
        this.$v.company.$touch();
        if (this.$v.company.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = set({}, path, value);
        await Companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshCompany();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = null;
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
    formatUserPayload (user) {
      return { ...removeEmptyProps(user), company: this.company._id };
    },
    async createUser () {
      try {
        this.loading = true;
        this.$v.newUser.$touch();
        if (this.$v.newUser.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Users.create(this.formatUserPayload(this.newUser));
        this.userCreationModal = false;
        await this.getUsers();
        NotifyPositive('Utilisateur enregistré.');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative('Cet email est déjà utilisé par un compte existant.');
        NotifyNegative('Erreur lors de la création de l\'utilisateur.');
      } finally {
        this.loading = false;
      }
    },
    resetUserCreationForm () {
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
      await this.getRoles();
      const coachRole = this.roles.find(role => role.name === COACH);
      if (coachRole) this.newUser.role = coachRole._id;
    },
    async openUserEditionModal (user) {
      if (this.roles.length === 0) await this.getRoles();

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
        await this.getUsers();
        NotifyPositive('Utilisateur modifié.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'utilisateur.');
      } finally {
        this.loading = false;
      }
    },
    async deleteUser (userId) {
      try {
        await Users.deleteById(userId);
        await this.getUsers();
        NotifyPositive('Utilisateur supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la suppression de l'utilisateur.");
      }
    },
    validateUserDeletion (userId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer cet utilisateur ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteUser(userId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
}
</script>
