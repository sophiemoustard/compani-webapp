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
        <ni-responsive-table :data="users" :columns="usersColumns" :pagination.sync="usersPagination">
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <div class="row no-wrap table-actions">
                      <q-icon color="grey" name="edit" @click.native="openUserEditionModal(props.row)" />
                      <!-- <q-icon color="grey" name="delete" @click.native="validateUserDeletion(col.value)" /> -->
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
            @click="userCreationModal = true" />
        </q-card-actions>
      </q-card>
    </div>

    <ni-modal v-model="userCreationModal" @hide="resetUserCreationForm" @show="openUserCreationModal">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">utilisateur</span>
      </template>
      <ni-input in-modal v-model="newUser.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model="newUser.identity.lastname" :error-label="REQUIRED_LABEL"
        :error="$v.newUser.identity.lastname.$error" caption="Nom" @blur="$v.newUser.identity.lastname.$touch"
        required-field />
      <ni-input in-modal v-model="newUser.local.email" :error="$v.newUser.local.email.$error" caption="Email"
        @blur="$v.newUser.local.email.$touch" :error-label="emailError($v.newUser)" required-field />
      <ni-input in-modal v-model.trim="newUser.contact.phone" :error="$v.newUser.contact.phone.$error"
        caption="Téléphone" @blur="$v.newUser.contact.phone.$touch" :error-label="phoneNbrError($v.newUser)" />
      <ni-select in-modal caption="Role" :options="roleOptions" v-model="newUser.role" :error-label="REQUIRED_LABEL"
        :error="$v.newUser.role.$error" @blur="$v.newUser.role.$touch" last required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un utilisateur" icon-right="add" color="primary"
          :loading="loading" @click="createUser" :disable="$v.newUser.$anyError || !$v.newUser.$anyDirty"/>
      </template>
    </ni-modal>

    <ni-modal v-model="userEditionModal" @hide="resetUserEditionForm">
      <template slot="title">
        Modifier un <span class="text-weight-bold">utilisateur</span>
      </template>
      <ni-input in-modal v-model="selectedUser.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model="selectedUser.identity.lastname" :error-label="REQUIRED_LABEL"
        :error="$v.selectedUser.identity.lastname.$error" caption="Nom" @blur="$v.selectedUser.identity.lastname.$touch"
        required-field />
      <ni-input in-modal v-model="selectedUser.local.email" :error="$v.selectedUser.local.email.$error" caption="Email"
        @blur="$v.selectedUser.local.email.$touch" :error-label="emailError($v.selectedUser)" required-field />
      <ni-input in-modal v-model.trim="selectedUser.contact.phone" :error="$v.selectedUser.contact.phone.$error"
        caption="Téléphone" @blur="$v.selectedUser.contact.phone.$touch" :error-label="phoneNbrError($v.selectedUser)" />
      <ni-select in-modal caption="Role" :options="roleOptions" v-model="selectedUser.role" :error-label="REQUIRED_LABEL"
        :error="$v.selectedUser.role.$error" @blur="$v.selectedUser.role.$touch" last required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Modifier un utilisateur" icon-right="check" color="primary"
          :loading="loading" @click="updateUser" :disable="$v.selectedUser.$anyError" />
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
import omit from 'lodash/omit';
import cloneDeep from 'lodash/cloneDeep';
import Companies from '@api/Companies';
import Users from '@api/Users';
import Roles from '@api/Roles';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { CLIENT_ADMIN, COACH, REQUIRED_LABEL } from '@data/constants';
import { coachRolesTranslation } from '@data/roles';
import { formatPhone, clear } from '@helpers/utils';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';

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
  data () {
    return {
      REQUIRED_LABEL,
      loading: false,
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
          format: value => value ? coachRolesTranslation[value] : '',
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
        sortBy: 'role',
      },
      newUser: {
        identity: {
          firstname: '',
          lastname: '',
        },
        contact: { phone: '' },
        role: '',
        local: { email: '' },
      },
      userValidation: {
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
      newUser: this.userValidation,
      selectedUser: this.userValidation,
    };
  },
  computed: {
    ...mapGetters({ company: 'company/getCompany' }),
    roleOptions () {
      return this.roles.map(role => ({ label: coachRolesTranslation[role.name], value: role._id }));
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
        NotifyPositive('Modification enregistrée');

        await this.refreshCompany();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = null;
      }
    },
    async getUsers () {
      try {
        this.users = await Users.list({ role: [CLIENT_ADMIN, COACH], company: this.company._id });
      } catch (e) {
        console.error(e);
        this.users = [];
      }
    },
    async createUser () {
      try {
        await Users.create(pickBy(this.newUser));
        this.userCreationModal = false;
        await this.getUsers();
        NotifyPositive('Utilisateur enregistré');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'utilisateur');
      }
    },
    resetUserCreationForm () {
      this.$v.newUser.$reset();
      this.newUSer = Object.assign({}, clear(this.newUser));
    },
    emailError (validationObj) {
      if (!validationObj.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!validationObj.local.email.email) {
        return 'Email non valide';
      }
      return '';
    },
    phoneNbrError (validationObj) {
      if (!this.$_.get(validationObj, 'contact.phone.frPhoneNumber', null)) {
        return 'Numéro de téléphone non valide';
      }
      return '';
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
      await this.getRoles();
      this.selectedUser = {
        ...this.selectedUser,
        ...pick(cloneDeep(user), ['_id', 'identity', 'local', 'contact', 'role']),
      };
      this.selectedUser.role = this.selectedUser.role.client._id;
      this.userEditionModal = true;
    },
    resetUserEditionForm () {
      this.$v.selectedUser.$reset();
      this.selectedUser = { identity: {}, local: {}, contact: {} };
    },
    async updateUser () {
      try {
        await Users.updateById(this.selectedUser._id, omit(this.selectedUser, ['_id']));
        this.userEditionModal = false;
        await this.getUsers();
        NotifyPositive('Utilisateur modifié');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition de l\'utilisateur');
      }
    },
  },
}
</script>
