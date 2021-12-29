<template>
  <div v-if="isLoaded">
    <div v-if="isCoach" class="row gutter-profile q-mb-xl">
      <ni-select-sector v-model="userProfile.sector" @blur="updateUser('sector')" @focus="saveTmp('sector')"
        :company-id="loggedUser.company._id" />
      <ni-input v-model="userProfile.mentor" caption="Marraine/parrain" @focus="saveTmp('mentor')"
        @blur="updateUser('mentor')" />
      <ni-select v-model="userProfile.role.client._id" caption="Rôle" :options="auxiliaryRolesOptions"
        @focus="saveTmp('role.client._id')" @blur="updateUser('role.client._id')" />
      <ni-select v-model="userProfile.establishment._id" caption="Établissement" :options="establishmentsOptions"
        @focus="saveTmp('establishment')" @blur="updateUser('establishment._id')"
        :error="v$.userProfile.establishment.$error" :error-message="REQUIRED_LABEL" option-disable="inactive" />
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Photo</p>
        <p :class="groupErrorsClass('picture')">{{ groupErrors('picture').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <!-- <ni-picture-uploader :user="userProfile" :refresh-picture="refreshUser" /> -->
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
        <p :class="groupErrorsClass('identity')">{{ groupErrors('identity').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom" :error="v$.userProfile.identity.firstname.$error"
          v-model.trim="userProfile.identity.firstname" @blur="updateUser('identity.firstname')"
          @focus="saveTmp('identity.firstname')" />
        <ni-input caption="Nom" :error="v$.userProfile.identity.lastname.$error"
          v-model.trim="userProfile.identity.lastname" @blur="updateUser('identity.lastname')"
          @focus="saveTmp('identity.lastname')" />
        <ni-select caption="Nationalité" :error="v$.userProfile.identity.nationality.$error"
          :options="nationalitiesOptions" v-model="userProfile.identity.nationality"
          @focus="saveTmp('identity.nationality')" @blur="updateUser('identity.nationality')" />
        <ni-date-input caption="Date de naissance" :error="v$.userProfile.identity.birthDate.$error"
          v-model="userProfile.identity.birthDate" @focus="saveTmp('identity.birthDate')"
          content-class="col-xs-12 col-md-6" @update:model-value="updateUser('identity.birthDate')" />
        <ni-select caption="Pays de naissance" :error="v$.userProfile.identity.birthCountry.$error"
          :options="countriesOptions" v-model="userProfile.identity.birthCountry"
          @focus="saveTmp('identity.birthCountry')" @blur="updateUser('identity.birthCountry')" />
        <ni-input caption="Département de naissance" :error="v$.userProfile.identity.birthState.$error"
          :error-message="birthStateError" v-model="userProfile.identity.birthState"
          @blur="updateUser('identity.birthState')" @focus="saveTmp('identity.birthState')"
          :hidden="userProfile.identity.birthCountry !== 'FR'" />
        <ni-input caption="Ville de naissance" :error="v$.userProfile.identity.birthCity.$error"
          v-model="userProfile.identity.birthCity" @focus="saveTmp('identity.birthCity')"
          @blur="updateUser('identity.birthCity')" />
        <ni-input caption="Numéro de sécurité sociale"
          :error="v$.userProfile.identity.socialSecurityNumber.$error"
          v-model="userProfile.identity.socialSecurityNumber" @focus="saveTmp('identity.socialSecurityNumber')"
          @blur="updateUser('identity.socialSecurityNumber')" :error-message="ssnError" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
        <p :class="groupErrorsClass('contact')">{{ groupErrors('contact').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Numéro de téléphone" :error="v$.userProfile.contact.phone.$error"
          :error-message="phoneNbrError(v$.userProfile)" type="tel" v-model.trim="userProfile.contact.phone"
          @blur="updateUser('contact.phone')" @focus="saveTmp('contact.phone')" />
        <div v-if="isCoach" class="col-12 col-md-6 row items-center">
          <div class="col-xs-11">
            <ni-input ref="userEmail" name="emailInput" caption="Adresse email" type="email" :disable="emailLock"
              :error="v$.userProfile.local.email.$error" @focus="saveTmp('local.email')" lower-case
              :error-message="emailError(v$.userProfile)" v-model.trim="userProfile.local.email" />
          </div>
          <div :class="['col-xs-1', 'row', 'justify-end', { 'cursor-pointer': emailLock }]">
            <ni-button :icon="lockIcon" @click="toggleEmailLock(!emailLock)" color="copper-grey-500" />
          </div>
        </div>
        <ni-search-address v-model="userProfile.contact.address" color="white"
          @focus="saveTmp('contact.address.fullAddress')" @blur="updateUser('contact.address')"
          :error-message="addressError" :error="v$.userProfile.contact.address.$error" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact d'urgence</p>
        <p :class="groupErrorsClass('emergencyContact')">{{ groupErrors('emergencyContact').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom et nom" :error="v$.userProfile.administrative.emergencyContact.name.$error"
          v-model="userProfile.administrative.emergencyContact.name"
          @focus="saveTmp('administrative.emergencyContact.name')"
          @blur="updateUser('administrative.emergencyContact.name')" />
        <ni-input caption="Numéro de téléphone"
          :error="v$.userProfile.administrative.emergencyContact.phoneNumber.$error"
          v-model.trim="userProfile.administrative.emergencyContact.phoneNumber"
          @focus="saveTmp('administrative.emergencyContact.phoneNumber')"
          @blur="updateUser('administrative.emergencyContact.phoneNumber')" :error-message="emergencyPhoneNbrError" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">IBAN</p>
        <p :class="groupErrorsClass('iban')">{{ groupErrors('iban').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="IBAN" :error="v$.userProfile.administrative.payment.rib.iban.$error"
          :error-message="ibanError" v-model="userProfile.administrative.payment.rib.iban" upper-case
          @focus="saveTmp('administrative.payment.rib.iban')" @blur="updateUser('administrative.payment.rib.iban')" />
        <ni-input caption="BIC" :error="v$.userProfile.administrative.payment.rib.bic.$error"
          :error-message="bicError" upper-case v-model.trim="userProfile.administrative.payment.rib.bic"
          @focus="saveTmp('administrative.payment.rib.bic')" @blur="updateUser('administrative.payment.rib.bic')" />
      </div>
    </div>
    <div v-if="userProfile.administrative.driveFolder" class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Documents</p>
        <p :class="groupErrorsClass('documents')">{{ groupErrors('documents').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12">
          <ni-option-group :display-caption="isAuxiliary" v-model="userProfile.administrative.identityDocs"
            type="radio" :options="identityDocsOptions" :error="v$.userProfile.administrative.identityDocs.$error"
            caption="Merci de nous indiquer le type de document d'identité que vous possédez." required-field
            :error-message="requiredLabel" @update:model-value="updateUser('administrative.identityDocs')" />
        </div>
        <div v-if="userProfile.administrative.identityDocs === 'cni'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Carte d'identité (recto)" path="administrative.idCardRecto"
            :entity="userProfile" name="idCardRecto" @uploaded="documentUploaded" :url="docsUploadUrl"
            @delete="validateDocumentDeletion('administrative.idCardRecto')"
            :error="v$.userProfile.administrative.idCardRecto.driveId.$error" :extensions="extensions"
            :additional-value="documentTitle('cni_recto')" drive-storage />
        </div>
        <div v-if="userProfile.administrative.identityDocs === 'cni'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Carte d'identité (verso)" path="administrative.idCardVerso"
            :entity="userProfile" :url="docsUploadUrl" name="idCardVerso" @uploaded="documentUploaded"
            @delete="validateDocumentDeletion('administrative.idCardVerso')"
            :extensions="extensions" :additional-value="documentTitle('cni_verso')" drive-storage />
        </div>
        <div v-if="userProfile.administrative.identityDocs === 'pp'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Passeport" path="administrative.passport" :url="docsUploadUrl"
            :entity="userProfile" name="passport" :additional-value="documentTitle('passport')"
            @delete="validateDocumentDeletion('administrative.passport')" @uploaded="documentUploaded"
            :error="v$.userProfile.administrative.passport.driveId.$error" :extensions="extensions" drive-storage />
        </div>
        <div v-if="userProfile.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Titre de séjour (recto)" path="administrative.residencePermitRecto"
            :entity="userProfile" @uploaded="documentUploaded" :url="docsUploadUrl"
            @delete="validateDocumentDeletion('administrative.residencePermitRecto')" :extensions="extensions"
            :error="v$.userProfile.administrative.residencePermitRecto.driveId.$error" name="residencePermitRecto"
            :additional-value="documentTitle('titre_de_séjour_recto')" drive-storage />
        </div>
        <div v-if="userProfile.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Titre de séjour (verso)" path="administrative.residencePermitVerso"
            name="residencePermitVerso" @uploaded="documentUploaded" :url="docsUploadUrl"
            @delete="validateDocumentDeletion('administrative.residencePermitVerso')" :extensions="extensions"
            :entity="userProfile" :additional-value="documentTitle('titre_de_séjour_verso')" drive-storage />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Attestation de sécurité sociale" path="administrative.healthAttest"
            :entity="userProfile" :url="docsUploadUrl" :extensions="extensions"
            @delete="validateDocumentDeletion('administrative.healthAttest')"
            name="healthAttest" @uploaded="documentUploaded" :additional-value="documentTitle('attestation_secu')"
            :error="v$.userProfile.administrative.healthAttest.driveId.$error" drive-storage />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Facture téléphonique" path="administrative.phoneInvoice"
            :entity="userProfile" :url="docsUploadUrl" :extensions="extensions"
            @delete="validateDocumentDeletion('administrative.phoneInvoice')"
            name="phoneInvoice" @uploaded="documentUploaded" :additional-value="documentTitle('facture_telephone')"
            :error="v$.userProfile.administrative.phoneInvoice.driveId.$error" drive-storage />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-multiple-files-uploader caption="Diplôme(s) ou certificat(s)" path="administrative.certificates"
            @delete="validateCertificateDeletion" name="certificates" :url="docsUploadUrl"
            collapsible-label="Ajouter un diplôme" :user-profile="userProfile" additional-fields-name="diplomes"
            @uploaded="documentUploaded" :extensions="extensions" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Mutuelle</p>
        <p :class="groupErrorsClass('mutualFund')">{{ groupErrors('mutualFund').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12">
          <div v-if="isAuxiliary" class="row justify-between">
            <p class="input-caption">Voulez-vous adhérer à la mutuelle d'entreprise ?</p>
            <q-icon v-if="v$.userProfile.administrative.mutualFund.has.$error" name="error_outline"
              color="secondary" />
          </div>
          <q-field dense :error="v$.userProfile.administrative.mutualFund.has.$error"
            :error-message="requiredLabel">
            <q-btn-toggle class="full-width" color="white" text-color="copper-grey-700" toggle-color="primary"
              v-model="userProfile.administrative.mutualFund.has" :options="mutualOptions"
              @update:model-value="updateUser('administrative.mutualFund.has')" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6" v-if="hasMutual">
          <ni-file-uploader caption="Justificatif mutuelle" path="administrative.mutualFund" :entity="userProfile"
            :extensions="extensions" name="mutualFund" drive-storage :additional-value="documentTitle('mutuelle')"
            @uploaded="documentUploaded" @delete="validateDocumentDeletion('administrative.mutualFund')"
            :error="v$.userProfile.administrative.mutualFund.driveId.$error" :url="docsUploadUrl" entity-url="users" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Transports</p>
        <p :class="groupErrorsClass('transportInvoice')">{{ groupErrors('transportInvoice').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12">
          <ni-option-group :display-caption="isAuxiliary"
            v-model="userProfile.administrative.transportInvoice.transportType" :options="transportOptions"
            caption="Par quel moyen comptez-vous vous rendre au travail ?" type="radio" :error-message="requiredLabel"
            :error="v$.userProfile.administrative.transportInvoice.transportType.$error" required-field
            @update:model-value="updateUser('administrative.transportInvoice.transportType')" />
        </div>
        <div v-if="userProfile.administrative.transportInvoice.transportType === 'public'"
          class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Justificatif d'abonnement" path="administrative.transportInvoice"
            :entity="userProfile" name="transportInvoice" @uploaded="documentUploaded"
            :error="v$.userProfile.administrative.transportInvoice.driveId.$error" :url="docsUploadUrl"
            :extensions="extensions" :additional-value="documentTitle('justif_transport')"
            @delete="validateDocumentDeletion('administrative.transportInvoice')" drive-storage />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Visite médicale</p>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Certificat d'aptitude" path="administrative.medicalCertificate"
            :entity="userProfile" name="medicalCertificate" @uploaded="documentUploaded"
            @delete="validateDocumentDeletion('administrative.medicalCertificate')" drive-storage
            :additional-value="documentTitle('certificat_medical')" :url="docsUploadUrl" :extensions="extensions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { required, email, numeric, minLength, maxLength, requiredIf } from '@vuelidate/validators';
import useVuelidate from '@vuelidate/core';
import get from 'lodash/get';
import set from 'lodash/set';
import Roles from '@api/Roles';
import Establishments from '@api/Establishments';
import Users from '@api/Users';
import gdrive from '@api/GoogleDrive';
import { formatQuantity } from '@helpers/utils';
import SelectSector from '@components/form/SelectSector';
import Button from '@components/Button';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import FileUploader from '@components/form/FileUploader';
import MultipleFilesUploader from '@components/form/MultipleFilesUploader';
import DateInput from '@components/form/DateInput';
import SearchAddress from '@components/form/SearchAddress';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
// import PictureUploader from '@components/PictureUploader';
import { frPhoneNumber, iban, frAddress, bic } from '@helpers/vuelidateCustomVal';
import {
  AUXILIARY,
  PLANNING_REFERENT,
  TRANSPORT_OPTIONS,
  REQUIRED_LABEL,
  COACH_ROLES,
  AUXILIARY_ROLES,
  DOC_EXTENSIONS,
} from '@data/constants';
import nationalities from '@data/nationalities';
import countries from '@data/countries';
import { userMixin } from '@mixins/userMixin';
import { validationMixin } from '@mixins/validationMixin';

export default {
  name: 'ProfileInfo',
  mixins: [validationMixin, userMixin],
  components: {
    'ni-select-sector': SelectSector,
    'ni-button': Button,
    'ni-input': Input,
    'ni-select': Select,
    'ni-file-uploader': FileUploader,
    'ni-multiple-files-uploader': MultipleFilesUploader,
    'ni-date-input': DateInput,
    'ni-search-address': SearchAddress,
    'ni-option-group': OptionGroup,
    // 'ni-picture-uploader': PictureUploader,
  },
  setup () { return { v$: useVuelidate() }; },
  data () {
    return {
      emailLock: true,
      transportOptions: TRANSPORT_OPTIONS,
      requiredLabel: REQUIRED_LABEL,
      requiredDoc: 'Document requis',
      docsThmbnails: {},
      isLoaded: false,
      tmpInput: '',
      identityType: '',
      pictureGroup: ['picture.link'],
      identityGroup: [
        'identity.firstname',
        'identity.lastname',
        'identity.nationality',
        'identity.birthDate',
        'identity.birthCountry',
        'identity.birthState',
        'identity.birthCity',
        'identity.socialSecurityNumber',
      ],
      contactGroup: ['contact.address', 'contact.zipCode', 'contact.city', 'contact.phone', 'contact.fullAddress'],
      emergencyContactGroup: [
        'administrative.emergencyContact.name',
        'administrative.emergencyContact.phoneNumber',
      ],
      ibanGroup: ['administrative.payment.rib.iban', 'administrative.payment.rib.bic'],
      documentsGroup: [
        'administrative.identityDocs',
        'administrative.idCardRecto.driveId',
        'administrative.passport.driveId',
        'administrative.residencePermitRecto.driveId',
        'administrative.healthAttest.driveId',
        'administrative.phoneInvoice.driveId',
      ],
      mutualFundGroup: ['administrative.mutualFund.has', 'administrative.mutualFund.driveId'],
      transportInvoiceGroup: [
        'administrative.transportInvoice.transportType',
        'administrative.transportInvoice.driveId',
      ],
      extensions: DOC_EXTENSIONS,
      auxiliaryRolesOptions: [],
      identityDocsOptions: [
        { label: 'Carte Nationale d\'Identité', value: 'cni' },
        { label: 'Passeport', value: 'pp' },
        { label: 'Titre de séjour', value: 'ts' },
      ],
      establishments: [],
      REQUIRED_LABEL,
      mutualOptions: [{ label: 'Oui', value: false }, { label: 'Non', value: true }],
    };
  },
  validations () {
    return {
      identityType: { required },
      userProfile: {
        local: { email: { required, email } },
        picture: { link: { required } },
        sector: { required },
        identity: {
          firstname: { required },
          lastname: { required },
          nationality: { required },
          birthDate: { required },
          birthCountry: { required },
          birthState: {
            required: requiredIf(() => this.userProfile.identity.birthCountry === 'FR'),
            numeric,
            minLength: minLength(2),
            maxLength: maxLength(3),
          },
          birthCity: { required },
          socialSecurityNumber: { required, numeric, minLength: minLength(15), maxLength: maxLength(15) },
        },
        contact: {
          phone: { required, frPhoneNumber },
          address: {
            zipCode: { required },
            street: { required },
            city: { required },
            fullAddress: { required, frAddress },
          },
        },
        establishment: { _id: { required } },
        administrative: {
          identityDocs: { required },
          emergencyContact: {
            name: { required },
            phoneNumber: { required, frPhoneNumber },
          },
          idCardRecto: {
            driveId: { required: requiredIf(() => this.userProfile.administrative.identityDocs === 'cni') },
          },
          passport: {
            driveId: { required: requiredIf(() => this.userProfile.administrative.identityDocs === 'pp') },
          },
          residencePermitRecto: {
            driveId: { required: requiredIf(() => this.userProfile.administrative.identityDocs === 'ts') },
          },
          healthAttest: { driveId: { required } },
          phoneInvoice: { driveId: { required } },
          payment: {
            rib: { iban: { required, iban }, bic: { required, bic } },
          },
          transportInvoice: {
            transportType: { required },
            driveId: {
              required: requiredIf(this.userProfile.administrative.transportInvoice.transportType === 'public'),
            },
          },
          mutualFund: {
            has: { required },
            driveId: { required: requiredIf(item => item.has) },
          },
        },
      },
      // pictureGroup: this.pictureGroup.map(g => `userProfile.${g}`),
      // identityGroup: this.identityGroup.map(g => `userProfile.${g}`),
      // contactGroup: this.contactGroup.map(g => `userProfile.${g}`),
      // emergencyContactGroup: this.emergencyContactGroup.map(g => `userProfile.${g}`),
      // ibanGroup: this.ibanGroup.map(g => `userProfile.${g}`),
      // documentsGroup: this.documentsGroup.map(g => `userProfile.${g}`),
      // mutualFundGroup: this.mutualFundGroup.map(g => `userProfile.${g}`),
      // transportInvoiceGroup: this.transportInvoiceGroup.map(g => `userProfile.${g}`),
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    ...mapState({
      userProfile: state => (AUXILIARY_ROLES.includes(get(state.main.loggedUser, 'role.client.name'))
        ? state.main.loggedUser
        : state.userProfile.userProfile),
    }),
    ...mapGetters({ clientRole: 'main/getClientRole' }),
    nationalitiesOptions () {
      return ['FR', ...Object.keys(nationalities).filter(nationality => nationality !== 'FR')]
        .map(nationality => ({ value: nationality, label: nationalities[nationality] }));
    },
    countriesOptions () {
      return ['FR', ...Object.keys(countries).filter(country => country !== 'FR')]
        .map(country => ({ value: country, label: countries[country] }));
    },
    docsUploadUrl () {
      const driveId = get(this.userProfile, 'administrative.driveFolder.driveId');
      if (!driveId) return '';

      return `${process.env.API_HOSTNAME}/users/${this.userProfile._id}/gdrive/${driveId}/upload`;
    },
    birthStateError () {
      const validations = this.v$.userProfile.identity.birthState;
      if (validations.required.$response === false) return REQUIRED_LABEL;
      if (validations.minLength.$response === false || validations.maxLength.$response === false ||
        validations.numeric.$response === false) return 'Departement non valide';

      return '';
    },
    ssnError () {
      const validations = this.v$.userProfile.identity.socialSecurityNumber;

      if (validations.required.$response === false) return REQUIRED_LABEL;
      if (validations.minLength.$response === false || validations.maxLength.$response === false ||
        validations.numeric.$response === false) return 'Numéro de sécurité sociale non valide';

      return '';
    },
    zipCodeError () {
      const validations = this.v$.userProfile.contact.zipCode;

      if (validations.required.$response === false) return REQUIRED_LABEL;
      if (validations.frZipCode.$response === false || validations.maxLength.$response === false) {
        return 'Code postal non valide';
      }

      return '';
    },
    emergencyPhoneNbrError () {
      const validations = this.v$.userProfile.administrative.emergencyContact.phoneNumber;

      if (validations.required.$reponse === false) return REQUIRED_LABEL;
      if (validations.frPhoneNumber.$reponse === false) return 'Numéro de téléphone non valide';

      return '';
    },
    ibanError () {
      const validations = this.v$.userProfile.administrative.payment.rib.iban;

      if (validations.required.$reponse === false) return REQUIRED_LABEL;
      if (validations.iban.$reponse === false) return 'IBAN non valide';

      return '';
    },
    bicError () {
      const validations = this.v$.userProfile.administrative.payment.rib.bic;

      if (validations.required.$reponse === false) return REQUIRED_LABEL;
      if (validations.bic.$reponse === false) return 'BIC non valide';

      return '';
    },
    addressError () {
      return this.v$.userProfile.contact.address.fullAddress.required.$reponse === false
        ? REQUIRED_LABEL
        : 'Adresse non valide';
    },
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.clientRole);
    },
    isCoach () {
      return COACH_ROLES.includes(this.clientRole);
    },
    establishmentsOptions () {
      return [
        { label: 'Non affecté', value: '', inactive: true },
        ...this.establishments.map(est => ({ label: est.name, value: est._id, inactive: false })),
      ];
    },
    hasMutual () {
      return get(this.userProfile, 'administrative.mutualFund.has');
    },
  },
  async created () {
    if (this.isCoach) await Promise.all([this.getAuxiliaryRoles(), this.getEstablishments()]);
    // this.v$.userProfile.$touch();
    this.isLoaded = true;
  },
  methods: {
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.userProfile, path);
    },
    async refreshUser () {
      AUXILIARY_ROLES.includes(this.clientRole)
        ? await this.$store.dispatch('main/fetchLoggedUser', this.userProfile._id)
        : await this.$store.dispatch('userProfile/fetchUserProfile', { userId: this.userProfile._id });
    },
    async updateAlenviUser (path) {
      try {
        let value = get(this.userProfile, path);
        if (path.match(/iban/i)) value = value.split(' ').join('');

        const payload = set({}, path, value);
        if (path === 'role.client._id') payload.role = value;
        if (path === 'establishment._id') payload.establishment = value;
        if (path.match(/birthCountry/i) && value !== 'FR') payload.identity.birthState = '99';

        await Users.updateById(this.userProfile._id, payload);
        await this.refreshUser();
      } catch (e) {
        console.error(e);
        throw e;
      }
    },
    documentTitle (path) {
      return `${path}_${this.userProfile.identity.firstname}_${this.userProfile.identity.lastname}`;
    },
    async deleteDocument (path) {
      try {
        const payload = set({}, path, { driveId: null, link: null });
        await Users.updateById(this.userProfile._id, payload);
        await gdrive.removeFileById({ id: get(this.userProfile, `${path}.driveId`) });

        await this.refreshUser();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    validateDocumentDeletion (path) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteDocument(path))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteCertificate (driveId) {
      try {
        await Users.updateCertificates(this.userProfile._id, { certificates: { driveId } });
        await gdrive.removeFileById({ id: driveId });

        await this.refreshUser();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    validateCertificateDeletion (driveId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteCertificate(driveId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async documentUploaded () {
      await this.refreshUser();
      NotifyPositive('Document envoyé');
    },
    groupErrors (group) {
      const j = 0;
      // const groupName = `${group}Group`;
      // for (let i = 0, l = this[groupName].length; i < l; i++) {
      //   if (this.v$[groupName][`userProfile.${this[groupName][i]}`].$error) j++;
      // }

      return {
        errors: j,
        msg: j > 0 ? formatQuantity('information manquante', j) : 'Informations complètes',
      };
    },
    groupErrorsClass (group) {
      return this.groupErrors(group).errors > 0 ? 'group-error' : 'group-error-ok';
    },
    async getAuxiliaryRoles () {
      try {
        const roles = await Roles.list({ name: [AUXILIARY, PLANNING_REFERENT] });
        this.auxiliaryRolesOptions = roles.map(role => ({
          label: role.name === AUXILIARY ? 'Auxiliaire' : 'Référent(e) planning',
          value: role._id,
        }));
      } catch (e) {
        console.error(e);
      }
    },
    async getEstablishments () {
      try {
        this.establishments = await Establishments.list();
      } catch (e) {
        console.error(e);
        this.establishments = [];
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.q-btn-group
  & :deep button
    flex: 1
.group-error
  font-size: 12px
  color: $secondary
  &-ok
    font-size: 12px
    color: $green-600
:deep .q-field--standard.q-field--focused
  .q-field__control:after
    display: none
</style>
