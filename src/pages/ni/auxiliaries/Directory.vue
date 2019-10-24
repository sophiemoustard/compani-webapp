<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire auxiliaires" toggleLabel="Actifs" :toggleValue="activeUsers" display-toggle
      @updateSearch="updateSearch" @toggle="activeUsers = !activeUsers" :search="searchStr" />
    <q-table :data="filteredUsers" :columns="columns" row-key="name" binary-state-sort :rows-per-page-options="[15, 25, 35]"
      :pagination.sync="pagination" :loading="tableLoading" class="people-list q-pa-sm neutral-background" flat>
      <q-tr slot="body" slot-scope="props" :props="props" :class="['datatable-row', { 'datatable-row-inactive': !props.row.isActive }]"
        @click.native="goToUserProfile(props.row.auxiliary._id)">
        <q-td v-for="col in props.cols" :key="col.name" :props="props">
          <q-item v-if="col.name === 'name'">
            <q-item-section avatar>
              <q-avatar size="30px">
                <img :src="getAvatar(col.value.picture)">
              </q-avatar>
            </q-item-section>
            <q-item-section> {{col.value.name}} </q-item-section>
          </q-item>
          <template v-else-if="col.name === 'profileErrors'">
            <q-icon v-if="notificationsProfiles[props.row.auxiliary._id] && props.row.isActive" name="error"
              color="secondary" size="1rem" />
          </template>
          <template v-else-if="col.name === 'tasksErrors'">
            <q-icon v-if="notificationsTasks[props.row.auxiliary._id] && props.row.isActive" name="error"
              color="secondary" size="1rem" />
          </template>
          <template v-else-if="col.name === 'active'">
            <div :class="{ activeDot: col.value, inactiveDot: !col.value }"></div>
          </template>
          <template v-else>{{ col.value }}</template>
        </q-td>
      </q-tr>
    </q-table>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une personne"
      @click="auxiliaryCreationModal = true" />

    <!-- User creation modal -->
    <ni-modal v-model="auxiliaryCreationModal" @hide="resetForm">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">fiche auxiliaire</span>
      </template>

      <ni-select in-modal v-model="newUser.identity.title" :options="civilityOptions" caption="Civilité"
        required-field :error="$v.newUser.identity.title.$error" @blur="$v.newUser.identity.title.$touch" />
      <ni-input in-modal v-model.trim="newUser.identity.lastname" :error="$v.newUser.identity.lastname.$error" caption="Nom"
        @blur="$v.newUser.identity.lastname.$touch" required-field />
      <ni-input in-modal v-model.trim="newUser.identity.firstname" :error="$v.newUser.identity.firstname.$error"
        caption="Prénom" @blur="$v.newUser.identity.firstname.$touch" required-field />
      <ni-input in-modal v-model="newUser.contact.phone" :error="$v.newUser.contact.phone.$error" required-field
        caption="Numéro de téléphone" @blur="$v.newUser.contact.phone.$touch" :error-label="mobilePhoneError" />
      <ni-input in-modal v-model="newUser.local.email" :error="$v.newUser.local.email.$error" caption="Email"
        @blur="$v.newUser.local.email.$touch" :error-label="emailError" required-field />
      <!-- <ni-search-address v-model="newUser.contact.address" color="white" inverted-light
        @blur="$v.newUser.contact.address.$touch" error-label="Adresse non valide"
        :error="$v.newUser.contact.address.$error" in-modal /> -->
      <div class="row margin-input">
        <div class="col-12">
          <div class="row justify-between">
            <p class="input-caption required">Équipe</p>
            <q-icon v-if="$v.newUser.sector.$error" name="error_outline" color="secondary" />
          </div>
          <ni-select-sector v-model="newUser.sector" @blur="$v.newUser.sector.$touch"
            :company-id="company._id" :error="$v.newUser.sector.$error" :error-label="REQUIRED_LABEL"/>
        </div>
      </div>
      <div class="row margin-input last">
        <div class="col-12">
          <q-checkbox v-model="sendWelcomeMsg" label="Envoyer SMS d'accueil" />
        </div>
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la fiche" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { required, requiredIf, email } from 'vuelidate/lib/validators';
import randomize from 'randomatic';
import { frPhoneNumber, frAddress } from '../../../helpers/vuelidateCustomVal';
import { userProfileValidation } from '../../../helpers/userProfileValidation';
import { taskValidation } from '../../../helpers/taskValidation';
import SelectSector from '../../../components/form/SelectSector';
import Input from '../../../components/form/Input';
import Select from '../../../components/form/Select';
// import SearchAddress from '../../../components/form/SearchAddress';
import DirectoryHeader from '../../../components/DirectoryHeader';
import Modal from '../../../components/Modal';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '../../../components/popup/notify.js';
import { DEFAULT_AVATAR, AUXILIARY, PLANNING_REFERENT, REQUIRED_LABEL, CIVILITY_OPTIONS } from '../../../data/constants';
import { validationMixin } from '../../../mixins/validationMixin.js';
export default {
  metaInfo: { title: 'Répertoire auxiliaires' },
  name: 'Directory',
  components: {
    'ni-select-sector': SelectSector,
    'ni-input': Input,
    'ni-select': Select,
    // 'ni-search-address': SearchAddress,
    'ni-directory-header': DirectoryHeader,
    'ni-modal': Modal,
  },
  mixins: [validationMixin],
  data () {
    return {
      tableLoading: true,
      loading: false,
      auxiliaryCreationModal: false,
      sendWelcomeMsg: true,
      civilityOptions: CIVILITY_OPTIONS.filter(opt => opt.value !== 'couple'),
      defaultNewUser: {
        identity: {
          lastname: '',
          firstname: '',
          title: '',
        },
        contact: {
          address: { fullAddress: '' },
          phone: '',
        },
        local: { email: '', password: '' },
        company: '',
        sector: null,
        administrative: {
          transportInvoice: { transportType: 'public' },
        },
      },
      newUser: null,
      userList: [],
      searchStr: '',
      activeUsers: true,
      pagination: {
        sortBy: 'startDate',
        descending: true,
        page: 1,
        rowsPerPage: 15,
      },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row.auxiliary,
          align: 'left',
          sortable: true,
          sort: (a, b) => {
            const aArr = a.name.split(' ');
            const bArr = b.name.split(' ');
            return aArr[aArr.length - 1].toLowerCase() < bArr[bArr.length - 1].toLowerCase() ? -1 : 1
          },
          style: 'min-width: 150px',
        },
        {
          name: 'profileErrors',
          label: 'Infos',
          field: 'profileErrors',
          align: 'left',
          sortable: true,
          style: 'min-width: 75px',
        },
        {
          name: 'tasksErrors',
          label: 'Tâches',
          field: 'tasksErrors',
          align: 'left',
          sortable: true,
          style: 'min-width: 82px',
        },
        {
          name: 'startDate',
          label: 'Depuis le...',
          field: 'startDate',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
          style: 'min-width: 110px',
        },
        {
          name: 'hiringDate',
          label: 'Embauche',
          field: 'hiringDate',
          align: 'left',
          sortable: true,
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : null,
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
          style: 'min-width: 110px',
        },
        {
          name: 'team',
          label: 'Équipe',
          field: 'sector',
          align: 'left',
          sortable: true,
          style: 'min-width: 100px',
        },
        {
          name: 'active',
          label: 'Actif',
          field: 'isActive',
          align: 'right',
          sortable: false,
          style: 'min-width: 30px',
        },
      ],
      REQUIRED_LABEL,
    }
  },
  validations: {
    newUser: {
      identity: {
        lastname: { required },
        firstname: { required },
        title: { required },
      },
      contact: {
        phone: { required, frPhoneNumber },
        address: {
          zipCode: { required: requiredIf(item => !!item.fullAddress) },
          street: { required: requiredIf(item => !!item.fullAddress) },
          city: { required: requiredIf(item => !!item.fullAddress) },
          fullAddress: { frAddress },
        },
      },
      local: {
        email: { required, email },
      },
      sector: { required },
    },
  },
  created () {
    this.newUser = this.$_.cloneDeep(this.defaultNewUser);
  },
  mounted () {
    this.getUserList();
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
    company () {
      return this.$store.getters['main/company'];
    },
    activeUserList () {
      if (this.activeUsers) {
        return this.userList.filter(user => user.isActive);
      }
      return this.userList.filter(user => !user.isActive);
    },
    filteredUsers () {
      return this.activeUserList.filter(user => user.auxiliary.name.match(new RegExp(this.searchStr, 'i')));
    },
    notificationsProfiles () {
      return this.$store.getters['rh/getNotificationsProfiles'];
    },
    notificationsTasks () {
      return this.$store.getters['rh/getNotificationsTasks'];
    },
    mobilePhoneError () {
      if (!this.$v.newUser.contact.phone.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newUser.contact.phone.frPhoneNumber || !this.$v.newUser.contact.phone.maxLength) {
        return 'Numéro de téléphone non valide';
      }
      return '';
    },
    zipCodeError () {
      if (!this.$v.newUser.contact.zipCode.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newUser.contact.zipCode.frZipCode || !this.$v.newUser.contact.zipCode.maxLength) {
        return 'Code postal non valide';
      }
      return '';
    },
    emailError () {
      if (!this.$v.newUser.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newUser.local.email.email) {
        return 'Email non valide';
      }
      return '';
    },
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    getHiringDate (user) {
      let hiringDate = null;
      if (user.contracts && user.contracts.length > 0) {
        const contracts = user.contracts;
        if (contracts.length === 1) {
          hiringDate = contracts[0].startDate;
        } else {
          hiringDate = this.$_.orderBy(contracts, ['startDate'], ['asc'])[0].startDate;
        }
      }
      return hiringDate;
    },
    async getUserList () {
      try {
        const users = await this.$users.showAll({ role: [AUXILIARY, PLANNING_REFERENT] });
        this.userList = users.map((user) => {
          const hiringDate = this.getHiringDate(user);
          if (user.isActive) {
            const checkProfileErrors = userProfileValidation(user);
            this.$store.commit('rh/saveNotification', {
              type: 'profiles',
              _id: user._id,
              exists: !!checkProfileErrors.error,
            });
            const checkTasks = taskValidation(user);
            this.$store.commit('rh/saveNotification', {
              type: 'tasks',
              _id: user._id,
              exists: checkTasks,
            });
            return {
              auxiliary: {
                _id: user._id,
                name: `${user.identity.firstname} ${user.identity.lastname}`,
                picture: user.picture ? user.picture.link : null,
              },
              profileErrors: checkProfileErrors.error,
              tasksErrors: checkTasks,
              startDate: user.createdAt,
              sector: user.sector ? user.sector.name : 'N/A',
              isActive: user.isActive,
              hiringDate,
            }
          }
          return {
            auxiliary: {
              _id: user._id,
              name: `${user.identity.firstname} ${user.identity.lastname}`,
              picture: user.picture ? user.picture.link : null,
            },
            startDate: user.createdAt,
            sector: user.sector ? user.sector.name : 'N/A',
            isActive: user.isActive,
            hiringDate,
          }
        });
        this.tableLoading = false;
      } catch (e) {
        this.tableLoading = false;
        console.error(e);
      }
    },
    goToUserProfile (userId) {
      this.$router.push({ name: 'personal info', params: { id: userId } });
    },
    resetForm () {
      this.$v.newUser.$reset();
      this.newUser = this.$_.cloneDeep(this.defaultNewUser);
    },
    formatPayloadForUserCreation (roles) {
      const payload = this.$_.cloneDeep(this.newUser);

      payload.local.password = randomize('*', 10);
      payload.role = roles[0]._id;
      payload.company = this.company._id;

      if (!payload.contact.address.fullAddress) delete payload.contact.address;

      return payload;
    },
    async createAlenviUser () {
      const roles = await this.$roles.showAll({ name: AUXILIARY });
      if (roles.length === 0) throw new Error('Role not found');

      const payload = this.formatPayloadForUserCreation(roles);

      const newUser = await this.$users.create(payload);
      await this.$users.createDriveFolder({ _id: newUser._id });
      return newUser;
    },
    async sendSms (newUserId) {
      const activationDataRaw = await this.$activationCode.create({ newUserId, userEmail: this.newUser.local.email });
      const code = activationDataRaw.activationData.code;
      await this.$twilio.sendSMS({
        to: `+33${this.newUser.contact.phone.substring(1)}`,
        body: `Bienvenue chez Alenvi ! :) Utilise ce code: ${code} pour pouvoir commencer ton enregistrement sur Compani avant ton intégration: ${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/enterCode :-)`,
      });
    },
    async submit () {
      try {
        this.loading = true;
        this.$v.newUser.$touch();
        const isValid = await this.waitForFormValidation(this.$v.newUser);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        const userCreated = await this.createAlenviUser();
        if (this.sendWelcomeMsg) {
          await this.sendSms(userCreated._id);
        }
        await this.getUserList();
        NotifyPositive('Fiche auxiliaire créée');
        this.auxiliaryCreationModal = false;
      } catch (e) {
        if (e && e.response) {
          console.error(e.response);
          if (e.response.status === 409) return NotifyNegative('Email déjà existant');
        }
        console.error(e);
        NotifyNegative('Erreur lors de la création de la fiche auxiliaire');
      } finally {
        this.loading = false;
      }
    },
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
  },
}
</script>
