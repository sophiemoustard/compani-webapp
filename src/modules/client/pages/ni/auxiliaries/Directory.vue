<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire auxiliaires" toggle-label="Actifs" :toggle-value="activeUsers" display-toggle
      @updateSearch="updateSearch" @toggle="activeUsers = !activeUsers" :search="searchStr" />
    <ni-table-list :data="filteredUsers" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      @goTo="goToUserProfile">
      <template v-slot:body="{ props, col }">
        <q-item v-if="col.name === 'name'">
          <q-item-section avatar>
            <img class="avatar" :src="getAvatar(col.value.picture)">
          </q-item-section>
          <q-item-section>{{ col.value.name }}</q-item-section>
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
      </template>
    </ni-table-list>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une personne"
      @click="auxiliaryCreationModal = true" />

    <!-- User creation modal -->
    <ni-modal v-model="auxiliaryCreationModal" @hide="resetForm">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">fiche auxiliaire</span>
      </template>
      <ni-select in-modal v-model="newUser.identity.title" :options="civilityOptions" caption="Civilité"
        required-field :error="$v.newUser.identity.title.$error" @blur="$v.newUser.identity.title.$touch" />
      <ni-input in-modal v-model.trim="newUser.identity.lastname" :error="$v.newUser.identity.lastname.$error"
        @blur="$v.newUser.identity.lastname.$touch" required-field caption="Nom" />
      <ni-input in-modal v-model.trim="newUser.identity.firstname" :error="$v.newUser.identity.firstname.$error"
        caption="Prénom" @blur="$v.newUser.identity.firstname.$touch" required-field />
      <ni-input in-modal v-model="newUser.contact.phone" :error="$v.newUser.contact.phone.$error" required-field
        caption="Numéro de téléphone" @blur="$v.newUser.contact.phone.$touch" :error-label="mobilePhoneError" />
      <ni-input in-modal v-model="newUser.local.email" :error="$v.newUser.local.email.$error" caption="Email"
        @blur="$v.newUser.local.email.$touch" :error-label="emailError" required-field />
      <ni-search-address v-model="newUser.contact.address" color="white" inverted-light
        @blur="$v.newUser.contact.address.$touch" error-label="Adresse non valide"
        :error="$v.newUser.contact.address.$error" in-modal />
      <div class="row margin-input">
        <div class="col-12">
          <div class="row justify-between">
            <p class="input-caption required">Équipe</p>
            <q-icon v-if="$v.newUser.sector.$error" name="error_outline" color="secondary" />
          </div>
          <ni-select-sector v-model="newUser.sector" @blur="$v.newUser.sector.$touch" in-modal
            :company-id="company._id" :error="$v.newUser.sector.$error" :error-label="REQUIRED_LABEL"/>
        </div>
      </div>
      <div class="row margin-input last">
        <q-checkbox v-model="sendWelcomeMsg" label="Envoyer SMS d'accueil" dense />
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
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
import ActivationCode from '@api/ActivationCode';
import Roles from '@api/Roles';
import Twilio from '@api/Twilio';
import Users from '@api/Users';
import SelectSector from '@components/form/SelectSector';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import SearchAddress from '@components/form/SearchAddress';
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import Modal from '@components/modal/Modal';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify.js';
import { frPhoneNumber, frAddress } from '@helpers/vuelidateCustomVal';
import { DEFAULT_AVATAR, AUXILIARY, AUXILIARY_ROLES, REQUIRED_LABEL, CIVILITY_OPTIONS } from '@data/constants';
import { userProfileValidation } from 'src/modules/client/helpers/userProfileValidation';
import { taskValidation } from 'src/modules/client/helpers/taskValidation';
import { validationMixin } from 'src/modules/client/mixins/validationMixin.js';

export default {
  metaInfo: { title: 'Répertoire auxiliaires' },
  name: 'Directory',
  components: {
    'ni-select-sector': SelectSector,
    'ni-input': Input,
    'ni-select': Select,
    'ni-search-address': SearchAddress,
    'ni-directory-header': DirectoryHeader,
    'ni-modal': Modal,
    'ni-table-list': TableList,
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
          style: 'min-width: 200px; width: 35%',
        },
        {
          name: 'profileErrors',
          label: 'Infos',
          field: 'profileErrors',
          align: 'left',
          sortable: true,
          style: 'min-width: 75px; width: 8%',
        },
        {
          name: 'tasksErrors',
          label: 'Tâches',
          field: 'tasksErrors',
          align: 'left',
          sortable: true,
          style: 'min-width: 82px; width: 8%',
        },
        {
          name: 'startDate',
          label: 'Depuis le...',
          field: 'startDate',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
          style: 'min-width: 110px; width: 15%',
        },
        {
          name: 'hiringDate',
          label: 'Embauche',
          field: 'hiringDate',
          align: 'left',
          sortable: true,
          format: (value) => value ? this.$moment(value).format('DD/MM/YYYY') : null,
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
          style: 'min-width: 110px; width: 15%',
        },
        {
          name: 'team',
          label: 'Équipe',
          field: 'sector',
          align: 'left',
          sortable: true,
          style: 'min-width: 100px; width: 15%',
        },
        {
          name: 'active',
          label: 'Actif',
          field: 'isActive',
          align: 'right',
          sortable: false,
          style: 'min-width: 30px; width: 4%',
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
    this.newUser = cloneDeep(this.defaultNewUser);
  },
  mounted () {
    this.getUserList();
  },
  computed: {
    currentUser () {
      return this.$store.getters['current/user'];
    },
    company () {
      return this.$store.getters['current/company'];
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
      if (!user.contracts || user.contracts.length === 0) return null;
      if (user.contracts.length === 1) return user.contracts[0].startDate;
      return orderBy(user.contracts, ['startDate'], ['asc'])[0].startDate;
    },
    formatUser (user) {
      const hiringDate = this.getHiringDate(user);
      const formattedUser = {
        auxiliary: {
          _id: user._id,
          name: `${user.identity.firstname} ${user.identity.lastname}`,
          picture: user.picture ? user.picture.link : null,
        },
        startDate: user.createdAt,
        sector: user.sector ? user.sector.name : 'N/A',
        isActive: user.isActive,
        hiringDate,
      };

      if (!user.isActive) return formattedUser;

      const checkProfileErrors = userProfileValidation(user);
      this.$store.commit('rh/saveNotification', {
        type: 'profiles',
        _id: user._id,
        exists: !!checkProfileErrors.error,
      });
      const checkTasks = taskValidation(user);
      this.$store.commit('rh/saveNotification', { type: 'tasks', _id: user._id, exists: checkTasks });

      return { ...formattedUser, profileErrors: checkProfileErrors.error, tasksErrors: checkTasks };
    },
    async getUserList () {
      try {
        const users = await Users.list({ role: AUXILIARY_ROLES, company: this.currentUser.company._id });
        this.userList = users.map(this.formatUser);
      } catch (e) {
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    goToUserProfile (row) {
      this.$router.push({ name: 'personal info', params: { auxiliaryId: row.auxiliary._id } });
    },
    resetForm () {
      this.$v.newUser.$reset();
      this.newUser = cloneDeep(this.defaultNewUser);
    },
    async formatUserCreationPayload () {
      const roles = await Roles.list({ name: AUXILIARY });
      if (roles.length === 0) throw new Error('Role not found');

      const payload = {
        ...cloneDeep(this.newUser),
        local: { password: randomize('*', 10), email: this.newUser.local.email },
        role: roles[0]._id,
      };
      if (!get(payload, 'contact.address.fullAddress')) delete payload.contact.address;

      return payload;
    },
    async createAlenviUser () {
      const folderId = get(this.company, 'auxiliariesFolderId', null);
      if (!folderId) throw new Error('No auxiliary folder in company drive');

      const payload = await this.formatUserCreationPayload();

      const newUser = await Users.create(payload);
      await Users.createDriveFolder(newUser._id, { parentFolderId: folderId });
      return newUser;
    },
    async sendSms (user) {
      if (!this.company.tradeName) return NotifyNegative('Veuillez renseigner votre nom commercial dans la page de configuration');

      const activationCode = await ActivationCode.create({ user });
      await Twilio.sendSMS({
        to: `+33${this.newUser.contact.phone.substring(1)}`,
        body: `${this.company.tradeName}. Bienvenue ! :)\nUtilise ce code: ${activationCode.code} pour pouvoir ` +
          'commencer ton enregistrement sur Compani avant ton intégration: ' +
          `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/enterCode :-)`,
      });
      NotifyPositive('SMS bien envoyé');
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
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative('Email déjà existant');
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
