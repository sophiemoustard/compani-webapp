<template>
  <q-page class="client-background" padding>
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
          <q-icon v-if="notifications.profiles[props.row.auxiliary._id] && props.row.isActive" name="error"
            color="secondary" size="1rem" />
        </template>
        <template v-else-if="col.name === 'active'">
          <div :class="{ 'dot dot-active': col.value, 'dot dot-inactive': !col.value }"></div>
        </template>
        <template v-else>{{ col.value }}</template>
      </template>
    </ni-table-list>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une personne"
      @click="auxiliaryCreationModal = true" :disable="tableLoading" />

    <!-- User creation modal -->
    <ni-modal v-model="auxiliaryCreationModal" @hide="resetForm">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">fiche auxiliaire</span>
      </template>
      <ni-input in-modal :disable="!firstStep" v-model="newUser.local.email" :error="$v.newUser.local.email.$error"
        @blur="$v.newUser.local.email.$touch" :error-label="emailError($v.newUser)" caption="Email" required-field />
      <template v-if="!firstStep">
        <ni-select in-modal v-model="newUser.identity.title" :options="civilityOptions" caption="Civilité"
          required-field :error="$v.newUser.identity.title.$error" @blur="$v.newUser.identity.title.$touch" />
        <ni-input in-modal v-model.trim="newUser.identity.lastname" :error="$v.newUser.identity.lastname.$error"
          @blur="$v.newUser.identity.lastname.$touch" required-field caption="Nom" />
        <ni-input in-modal v-model.trim="newUser.identity.firstname" :error="$v.newUser.identity.firstname.$error"
          caption="Prénom" @blur="$v.newUser.identity.firstname.$touch" required-field />
        <ni-input in-modal v-model="newUser.contact.phone" :error="$v.newUser.contact.phone.$error" required-field
          caption="Numéro de téléphone" @blur="$v.newUser.contact.phone.$touch" :error-label="mobilePhoneError" />
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
      </template>
      <template slot="footer">
        <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary"
          :loading="loading" icon-right="add" @click="nextStep" />
        <q-btn v-else no-caps class="full-width modal-btn" label="Créer la fiche" color="primary"
          :loading="loading" icon-right="add" @click="submit" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import cloneDeep from 'lodash/cloneDeep';
import orderBy from 'lodash/orderBy';
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
import { DEFAULT_AVATAR, AUXILIARY, AUXILIARY_ROLES, REQUIRED_LABEL, CIVILITY_OPTIONS } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import { userMixin } from '@mixins/userMixin';
import { userProfileValidation } from 'src/modules/client/helpers/userProfileValidation';
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
  mixins: [validationMixin, userMixin],
  data () {
    return {
      tableLoading: false,
      loading: false,
      auxiliaryCreationModal: false,
      firstStep: true,
      fetchedUser: {},
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
        local: { email: '' },
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
          align: 'left',
          sortable: true,
          style: 'min-width: 75px; width: 8%',
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
  validations () { return { newUser: this.userValidation } },
  async created () {
    this.newUser = cloneDeep(this.defaultNewUser);
    await this.getUserList();
  },
  computed: {
    ...mapState('rh', ['notifications']),
    ...mapGetters({ company: 'main/getCompany' }),
    activeUserList () {
      if (this.activeUsers) return this.userList.filter(user => user.isActive);
      return this.userList.filter(user => !user.isActive);
    },
    filteredUsers () {
      return this.activeUserList.filter(user => user.auxiliary.name.match(new RegExp(this.searchStr, 'i')));
    },
    mobilePhoneError () {
      if (!this.$v.newUser.contact.phone.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newUser.contact.phone.frPhoneNumber || !this.$v.newUser.contact.phone.maxLength) {
        return 'Numéro de téléphone non valide';
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
          name: formatIdentity(user.identity, 'FL'),
          picture: user.picture ? user.picture.link : null,
        },
        startDate: user.createdAt,
        sector: user.sector ? user.sector.name : 'N/A',
        isActive: user.isActive,
        hiringDate,
      };

      if (!user.isActive) return formattedUser;

      const checkProfileErrors = userProfileValidation(user);
      this.$store.dispatch(
        'rh/setNotification',
        { type: 'profiles', _id: user._id, exists: !!checkProfileErrors.error }
      );

      return { ...formattedUser, profileErrors: checkProfileErrors.error };
    },
    async getUserList () {
      try {
        this.tableLoading = true;
        const users = await Users.list({ role: AUXILIARY_ROLES, company: this.company._id });
        this.userList = Object.freeze(users.map(this.formatUser));
      } catch (e) {
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    goToUserProfile (row) {
      this.$router.push({ name: 'ni auxiliaries info', params: { auxiliaryId: row.auxiliary._id } });
    },
    resetForm () {
      this.$v.newUser.$reset();
      this.newUser = cloneDeep(this.defaultNewUser);
      this.firstStep = true;
      this.fetchedUser = {};
    },
    async formatUserPayload () {
      const roles = await Roles.list({ name: AUXILIARY });
      if (roles.length === 0) throw new Error('Role not found');

      const payload = {
        ...cloneDeep(this.newUser),
        local: { email: this.newUser.local.email },
        role: roles[0]._id,
      };
      if (!get(payload, 'contact.address.fullAddress')) delete payload.contact.address;

      return payload;
    },
    async sendSMS (user) {
      if (!this.company.tradeName) return NotifyNegative('Veuillez renseigner votre nom commercial dans la page de configuration.');

      const passwordToken = await Users.createPasswordToken(user._id, { email: user.local.email });
      await Twilio.sendSMS({
        to: `+33${user.contact.phone.substring(1)}`,
        body: `${this.company.tradeName}. Bienvenue ! :)\nPour pouvoir ` +
          'commencer ton enregistrement sur Compani avant ton intégration, crée ton mot de passe en suivant ce lien: ' +
          `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}/reset-password/${passwordToken.token} :-)\n` +
          `Par la suite pour te connecter suis ce lien: ${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}.`,
      });
      NotifyPositive('SMS bien envoyé');
    },
    fillNewUser (user) {
      const paths = [
        'identity.lastname',
        'identity.firstname',
        'identity.title',
        'contact.adresse.fullAddress',
        'contact.phone',
        'sector',
      ];
      paths.forEach(path => {
        const value = get(user, path)
        if (value) set(this.newUser, path, value);
      });
      if (!user.company) this.newUser.company = this.company._id;
    },
    async nextStep () {
      try {
        this.$v.newUser.$touch();
        if (this.$v.newUser.local.email.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.loading = true;
        const userExistsInfo = await Users.exists({ email: this.newUser.local.email });

        if (userExistsInfo.exists) {
          const hasPermissionOnUserInfo = !!userExistsInfo.user._id;
          const userHasValidCompany =
            !get(userExistsInfo, 'user.company') ||
             get(userExistsInfo, 'user.company') === this.company._id;
          const userHasClientRole = !!get(userExistsInfo, 'user.role.client');

          if (hasPermissionOnUserInfo && userHasValidCompany && !userHasClientRole) {
            this.fetchedUser = await Users.getById(userExistsInfo.user._id)
            this.fillNewUser(this.fetchedUser);
          } else {
            const otherCompanyEmail = !userHasValidCompany || !hasPermissionOnUserInfo;
            if (otherCompanyEmail) return NotifyNegative('Email relié à une autre structure.');
            else if (userHasClientRole) return NotifyNegative('Email déjà existant.');
          }
        }

        this.firstStep = false;
        this.$v.newUser.$reset();
      } catch (e) {
        NotifyNegative('Erreur lors de la création de la fiche auxiliaire.');
      } finally {
        this.loading = false;
      }
    },
    async submit () {
      let editedUser = {};
      try {
        this.loading = true;
        this.$v.newUser.$touch();
        const isValid = await this.waitForFormValidation(this.$v.newUser);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        const folderId = get(this.company, 'auxiliariesFolderId', null);
        if (!folderId) return NotifyNegative('Erreur lors de la création de la fiche auxiliaire.');

        const payload = await this.formatUserPayload();

        if (this.fetchedUser._id) {
          await Users.updateById(this.fetchedUser._id, payload);
          editedUser = { contact: { phone: get(payload, 'contact.phone') || '' }, ...this.fetchedUser };
        } else {
          editedUser = await Users.create(payload);
        }
        await Users.createDriveFolder(editedUser._id, { parentFolderId: folderId });
        await this.getUserList();
        NotifyPositive('Fiche auxiliaire créée');

        this.auxiliaryCreationModal = false;
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative('Email déjà existant.');
        NotifyNegative('Erreur lors de la création de la fiche auxiliaire.');
      } finally {
        this.loading = false;
      }
      try {
        if (this.sendWelcomeMsg) await this.sendSMS(editedUser);
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 400) return NotifyNegative('Le numéro entré ne recoit pas les SMS');
        NotifyNegative('Erreur lors de l\'envoi de SMS');
      }
    },
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
  },
}
</script>
