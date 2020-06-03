<template>
  <div v-if="isLoaded">
    <div v-if="isCoach" class="row gutter-profile q-mb-xl">
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Équipe</p>
        <ni-select-sector v-model="mergedUserProfile.sector" @blur="updateUser('sector')" @focus="saveTmp('sector')"
          :company-id="loggedUser.company._id" />
      </div>
      <ni-input v-model="mergedUserProfile.mentor" caption="Marraine/parrain" @focus="saveTmp('mentor')"
        @blur="updateUser('mentor')" />
      <ni-select v-model="mergedUserProfile.role.client._id" caption="Rôle" :options="auxiliaryRolesOptions"
        @focus="saveTmp('role.client._id')" @blur="updateUser('role.client._id')" />
      <ni-select v-model="mergedUserProfile.establishment" caption="Établissement" :options="establishmentsOptions"
        @focus="saveTmp('establishment')" @blur="updateUser('establishment')"
        :error="$v.mergedUserProfile.establishment.$error" :error-label="REQUIRED_LABEL" option-disable="inactive" />
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Photo</p>
        <p :class="groupErrorsClass('picture')">{{ groupErrors('picture').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <div class="row" style="background: white">
            <div class="row justify-center col-xs-12" style="padding: 12px 0px;">
              <croppa v-model="croppa" canvas-color="#EEE" accept="image/*" :initial-image="pictureLink"
                :prevent-white-space="true" placeholder="Clique ici pour choisir ta photo" placeholder-color="black"
                :placeholder-font-size="10" :show-remove-button="false" :disable-drag-and-drop="disablePictureEdition"
                :disable-drag-to-move="disablePictureEdition" :disable-scroll-to-zoom="disablePictureEdition"
                :disable-pinch-to-zoom="disablePictureEdition" @file-choose="choosePicture" />
            </div>
            <div class="row justify-center col-xs-12">
              <q-btn v-if="disablePictureEdition && hasPicture" color="primary" round flat
                icon="mdi-square-edit-outline" size="1rem" @click="disablePictureEdition = false" />
              <q-btn v-if="disablePictureEdition && hasPicture" color="primary" round flat icon="delete" size="1rem"
                @click="validateImageDeletion" />
              <q-btn v-if="!disablePictureEdition" color="primary" icon="clear" @click="closePictureEdition" round flat
                size="1rem" />
              <q-btn v-if="!disablePictureEdition" color="primary" icon="rotate_left" @click="croppa.rotate(-1)" round
                flat size="1rem" />
              <q-btn v-if="!disablePictureEdition" color="primary" icon="rotate_right" @click="croppa.rotate(1)" round
                flat size="1rem" />
              <q-btn v-if="!disablePictureEdition" :loading="loadingImage" color="primary" icon="done"
                @click="uploadImage" round flat size="1rem" />
              <q-btn v-if="hasPicture && disablePictureEdition" color="primary" round flat icon="save_alt" size="1rem"
                type="a" :href="pictureDlLink(pictureLink)" target="_blank" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
        <p :class="groupErrorsClass('identity')">{{ groupErrors('identity').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom" :error="$v.mergedUserProfile.identity.firstname.$error"
          v-model.trim="mergedUserProfile.identity.firstname" @blur="updateUser('identity.firstname')"
          @focus="saveTmp('identity.firstname')" />
        <ni-input caption="Nom" :error="$v.mergedUserProfile.identity.lastname.$error"
          v-model.trim="mergedUserProfile.identity.lastname" @blur="updateUser('identity.lastname')"
          @focus="saveTmp('identity.lastname')" />
        <ni-select caption="Nationalité" :error="$v.mergedUserProfile.identity.nationality.$error"
          :options="nationalitiesOptions" v-model="mergedUserProfile.identity.nationality"
          @focus="saveTmp('identity.nationality')" in-form @blur="updateUser('identity.nationality')" />
        <ni-date-input caption="Date de naissance" :error="$v.mergedUserProfile.identity.birthDate.$error"
          v-model="mergedUserProfile.identity.birthDate" @focus="saveTmp('identity.birthDate')"
          content-class="col-xs-12 col-md-6" @input="updateUser('identity.birthDate')" />
        <ni-select caption="Pays de naissance" :error="$v.mergedUserProfile.identity.birthCountry.$error"
          :options="countriesOptions" v-model="mergedUserProfile.identity.birthCountry"
          @focus="saveTmp('identity.birthCountry')" in-form @blur="updateUser('identity.birthCountry')" />
        <ni-input caption="Département de naissance" :error="$v.mergedUserProfile.identity.birthState.$error"
          :error-label="birthStateError" v-model="mergedUserProfile.identity.birthState"
          @blur="updateUser('identity.birthState')" @focus="saveTmp('identity.birthState')"
          :hidden="this.mergedUserProfile.identity.birthCountry !== 'FR'" />
        <ni-input caption="Ville de naissance" :error="$v.mergedUserProfile.identity.birthCity.$error"
          v-model="mergedUserProfile.identity.birthCity" @focus="saveTmp('identity.birthCity')"
          @blur="updateUser('identity.birthCity')" />
        <ni-input caption="Numéro de sécurité sociale"
          :error="$v.mergedUserProfile.identity.socialSecurityNumber.$error"
          v-model="mergedUserProfile.identity.socialSecurityNumber" @focus="saveTmp('identity.socialSecurityNumber')"
          @blur="updateUser('identity.socialSecurityNumber')" :error-label="ssnError" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
        <p :class="groupErrorsClass('contact')">{{ groupErrors('contact').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Numéro de téléphone" :error="$v.mergedUserProfile.contact.phone.$error"
          :error-label="phoneNbrError($v.mergedUserProfile)" type="tel" v-model.trim="mergedUserProfile.contact.phone"
          @blur="updateUser('contact.phone')" @focus="saveTmp('contact.phone')" />
        <div v-if="isCoach" class="col-12 col-md-6 row items-center">
          <div class="col-xs-11">
            <ni-input ref="userEmail" name="emailInput" caption="Adresse email" type="email" :disable="emailLock"
              :error="$v.mergedUserProfile.local.email.$error" @focus="saveTmp('local.email')" lower-case
              :error-label="emailError($v.mergedUserProfile)" v-model.trim="mergedUserProfile.local.email" />
          </div>
          <div :class="['col-xs-1', 'row', 'justify-end', { 'cursor-pointer': emailLock }]">
            <q-icon size="1.5rem" :name="lockIcon" @click.native="toggleEmailLock(!emailLock)" />
          </div>
        </div>
        <ni-search-address v-model="mergedUserProfile.contact.address" color="white"
          @focus="saveTmp('contact.address.fullAddress')" @blur="updateUser('contact.address')"
          :error-label="addressError" :error="$v.mergedUserProfile.contact.address.$error" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact d'urgence</p>
        <p :class="groupErrorsClass('emergencyContact')">{{ groupErrors('emergencyContact').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom et nom" :error="$v.mergedUserProfile.administrative.emergencyContact.name.$error"
          v-model="mergedUserProfile.administrative.emergencyContact.name"
          @focus="saveTmp('administrative.emergencyContact.name')"
          @blur="updateUser('administrative.emergencyContact.name')" />
        <ni-input caption="Numéro de téléphone"
          :error="$v.mergedUserProfile.administrative.emergencyContact.phoneNumber.$error"
          v-model.trim="mergedUserProfile.administrative.emergencyContact.phoneNumber"
          @focus="saveTmp('administrative.emergencyContact.phoneNumber')"
          @blur="updateUser('administrative.emergencyContact.phoneNumber')" :error-label="emergencyPhoneNbrError" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">IBAN</p>
        <p :class="groupErrorsClass('iban')">{{ groupErrors('iban').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="IBAN" :error="$v.mergedUserProfile.administrative.payment.rib.iban.$error"
          :error-label="ibanError" v-model="mergedUserProfile.administrative.payment.rib.iban" upper-case
          @focus="saveTmp('administrative.payment.rib.iban')" @blur="updateUser('administrative.payment.rib.iban')" />
        <ni-input caption="BIC" :error="$v.mergedUserProfile.administrative.payment.rib.bic.$error"
          :error-label="bicError" upper-case v-model.trim="mergedUserProfile.administrative.payment.rib.bic"
          @focus="saveTmp('administrative.payment.rib.bic')" @blur="updateUser('administrative.payment.rib.bic')" />
      </div>
    </div>
    <div v-if="mergedUserProfile.administrative.driveFolder" class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Documents</p>
        <p :class="groupErrorsClass('documents')">{{ groupErrors('documents').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12">
          <ni-option-group :display-caption="isAuxiliary" v-model="mergedUserProfile.administrative.identityDocs"
            type="radio" :options="identityDocsOptions" :error="$v.mergedUserProfile.administrative.identityDocs.$error"
            caption="Merci de nous indiquer le type de document d'identité que tu possèdes." required-field
            :error-label="requiredLabel" @input="updateUser('administrative.identityDocs')" />
        </div>
        <div v-if="mergedUserProfile.administrative.identityDocs === 'cni'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Carte d'identité (recto)" path="administrative.idCardRecto" alt="cni recto"
            :entity="mergedUserProfile" name="idCardRecto" @uploaded="refreshUser" :url="docsUploadUrl"
            @delete="validateDocumentDeletion('administrative.idCardRecto')"
            :error="$v.mergedUserProfile.administrative.idCardRecto.driveId.$error" :extensions="extensions"
            :additional-value="documentTitle('cni_recto')" />
        </div>
        <div v-if="mergedUserProfile.administrative.identityDocs === 'cni'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Carte d'identité (verso)" path="administrative.idCardVerso" alt="cni verso"
            :entity="mergedUserProfile" :url="docsUploadUrl" name="idCardVerso" @uploaded="refreshUser"
            @delete="validateDocumentDeletion('administrative.idCardVerso')"
            :extensions="extensions" :additional-value="documentTitle('cni_verso')" />
        </div>
        <div v-if="mergedUserProfile.administrative.identityDocs === 'pp'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Passeport" path="administrative.passport" alt="passeport" :url="docsUploadUrl"
            :entity="mergedUserProfile" name="passport" :additional-value="documentTitle('passport')"
            @delete="validateDocumentDeletion('administrative.passport')" @uploaded="refreshUser"
            :error="$v.mergedUserProfile.administrative.passport.driveId.$error" :extensions="extensions" />
        </div>
        <div v-if="mergedUserProfile.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Titre de séjour (recto)" path="administrative.residencePermitRecto"
            alt="titre de séjour (recto)" :entity="mergedUserProfile" @uploaded="refreshUser" :url="docsUploadUrl"
            @delete="validateDocumentDeletion('administrative.residencePermitRecto')" :extensions="extensions"
            :error="$v.mergedUserProfile.administrative.residencePermitRecto.driveId.$error" name="residencePermitRecto"
            :additional-value="documentTitle('titre_de_séjour_recto')" />
        </div>
        <div v-if="mergedUserProfile.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Titre de séjour (verso)" path="administrative.residencePermitVerso"
            alt="titre de séjour (verso)" name="residencePermitVerso" @uploaded="refreshUser" :url="docsUploadUrl"
            @delete="validateDocumentDeletion('administrative.residencePermitVerso')" :extensions="extensions"
            :entity="mergedUserProfile"  :additional-value="documentTitle('titre_de_séjour_verso')" />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Attestation de sécurité sociale" path="administrative.healthAttest"
            alt="attestation secu" :entity="mergedUserProfile" :url="docsUploadUrl" :extensions="extensions"
            @delete="validateDocumentDeletion('administrative.healthAttest')"
            name="healthAttest" @uploaded="refreshUser" :additional-value="documentTitle('attestation_secu')"
            :error="$v.mergedUserProfile.administrative.healthAttest.driveId.$error" />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Facture téléphonique" path="administrative.phoneInvoice" alt="facture téléphone"
            :entity="mergedUserProfile" :url="docsUploadUrl" :extensions="extensions"
            @delete="validateDocumentDeletion('administrative.phoneInvoice')"
            name="phoneInvoice" @uploaded="refreshUser" :additional-value="documentTitle('facture_telephone')"
            :error="$v.mergedUserProfile.administrative.phoneInvoice.driveId.$error" />
        </div>
        <div class="col-xs-12">
          <ni-multiple-files-uploader caption="Diplome(s) ou certificat(s)" path="administrative.certificates"
            alt="facture téléphone" @delete="validateCertificateDeletion" name="certificates"
            collapsible-label="Ajouter un diplôme" :user-profile="mergedUserProfile" :url="docsUploadUrl"
            additional-fields-name="diplomes" @uploaded="refreshUser" :extensions="extensions" />
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
            <p class="input-caption">Veux-tu adhérer à la mutuelle d'entreprise ?</p>
            <q-icon v-if="$v.mergedUserProfile.administrative.mutualFund.has.$error" name="error_outline"
              color="secondary" />
          </div>
          <q-field dense :error="$v.mergedUserProfile.administrative.mutualFund.has.$error"
            :error-label="requiredLabel">
            <q-btn-toggle class="full-width" color="white" text-color="black" toggle-color="primary"
              v-model="mergedUserProfile.administrative.mutualFund.has"
              @input="updateUser('administrative.mutualFund.has')" :options="mutualOptions" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6" v-if="hasMutual">
          <ni-file-uploader
            caption="Merci de nous transmettre une attestation prouvant que tu es déjà affilié(e) à une autre mutuelle"
            path="administrative.mutualFund" alt="justif mutuelle" :entity="mergedUserProfile" :url="docsUploadUrl"
            @delete="validateDocumentDeletion('administrative.mutualFund')" :extensions="extensions" entity-url="users"
            name="mutualFund" @uploaded="refreshUser" :additional-value="documentTitle('mutuelle')"
            :error="$v.mergedUserProfile.administrative.mutualFund.driveId.$error" :display-caption="isAuxiliary" />
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
            v-model="mergedUserProfile.administrative.transportInvoice.transportType" :options="transportOptions"
            caption="Par quel moyen comptes-tu te rendre au travail ?" type="radio" :error-label="requiredLabel"
            :error="$v.mergedUserProfile.administrative.transportInvoice.transportType.$error" required-field
            @input="updateUser('administrative.transportInvoice.transportType')" />
        </div>
        <div v-if="mergedUserProfile.administrative.transportInvoice.transportType === 'public'"
          class="col-xs-12 col-md-6">
          <ni-file-uploader :caption="captionTransportUploader" path="administrative.transportInvoice"
            alt="justif transport" :entity="mergedUserProfile" name="transportInvoice" @uploaded="refreshUser"
            :error="$v.mergedUserProfile.administrative.transportInvoice.driveId.$error" :url="docsUploadUrl"
            :extensions="extensions" :additional-value="documentTitle('justif_transport')"
            @delete="validateDocumentDeletion('administrative.transportInvoice')" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Visite médicale</p>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Certificat d'aptitude" path="administrative.medicalCertificate"
            alt="certificat médical" :entity="mergedUserProfile" name="medicalCertificate" @uploaded="refreshUser"
            @delete="validateDocumentDeletion('administrative.medicalCertificate')"
            :additional-value="documentTitle('certificat_medical')" :url="docsUploadUrl" :extensions="extensions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'vue-croppa/dist/vue-croppa.css'
import { mapState, mapGetters } from 'vuex';
import { Cookies } from 'quasar';
import { required, email, numeric, minLength, maxLength, requiredIf } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import isEqual from 'lodash/isEqual';
import Roles from '@api/Roles';
import Establishments from '@api/Establishments';
import Users from '@api/Users';
import gdrive from '@api/GoogleDrive';
import cloudinary from '@api/Cloudinary';
import SelectSector from '@components/form/SelectSector';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import FileUploader from '@components/form/FileUploader.vue';
import MultipleFilesUploader from '@components/form/MultipleFilesUploader.vue';
import DateInput from '@components/form/DateInput.vue';
import SearchAddress from '@components/form/SearchAddress';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { frPhoneNumber, iban, frAddress, bic } from '@helpers/vuelidateCustomVal';
import { extend, removeDiacritics } from '@helpers/utils';
import {
  AUXILIARY,
  PLANNING_REFERENT,
  TRANSPORT_OPTIONS,
  REQUIRED_LABEL,
  COACH_ROLES,
  AUXILIARY_ROLES,
} from '@data/constants';
import nationalities from '@data/nationalities';
import countries from '@data/countries';
import { userMixin } from '@mixins/userMixin';
import { validationMixin } from 'src/modules/client/mixins/validationMixin';

export default {
  name: 'ProfileInfo',
  mixins: [validationMixin, userMixin],
  components: {
    'ni-select-sector': SelectSector,
    'ni-input': Input,
    'ni-select': Select,
    'ni-file-uploader': FileUploader,
    'ni-multiple-files-uploader': MultipleFilesUploader,
    'ni-date-input': DateInput,
    'ni-search-address': SearchAddress,
    'ni-option-group': OptionGroup,
  },
  data () {
    return {
      emailLock: true,
      transportOptions: TRANSPORT_OPTIONS,
      requiredLabel: REQUIRED_LABEL,
      requiredDoc: 'Document requis',
      disablePictureEdition: true,
      docsThmbnails: {},
      croppa: {},
      loadingImage: false,
      fileChosen: false,
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
      mergedUserProfile: {
        mentorId: '',
        local: { email: '' },
        picture: { link: '' },
        identity: {
          nationality: '',
          birthDate: '',
          birthCountry: '',
          birthState: '',
          birthCity: '',
          socialSecurityNumber: '',
        },
        contact: {
          address: { fullAddress: '' },
        },
        role: { client: { _id: '' } },
        administrative: {
          emergencyContact: { name: '', phoneNumber: '' },
          identityDocs: '',
          idCardRecto: {},
          idCardVerso: {},
          healthAttest: {},
          passport: {},
          residencePermitRecto: {},
          residencePermitVerso: {},
          mutualFund: { has: null },
          certificates: [],
          medicalCertificate: {},
          phoneInvoice: {},
          transportInvoice: { type: '' },
          payment: {
            rib: { iban: '', bic: '' },
          },
        },
        establishment: null,
      },
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
      auxiliaryRolesOptions: [],
      identityDocsOptions: [
        { label: 'Carte Nationale d\'Identité', value: 'cni' },
        { label: 'Passeport', value: 'pp' },
        { label: 'Titre de séjour', value: 'ts' },
      ],
      establishments: [],
      REQUIRED_LABEL,
      mutualOptions: [{ label: 'Oui', value: false }, { label: 'Non', value: true }],
    }
  },
  validations () {
    return {
      identityType: { required },
      mergedUserProfile: {
        local: {
          email: { required, email },
        },
        picture: {
          link: { required },
        },
        sector: { required },
        mentorId: { required },
        identity: {
          firstname: { required },
          lastname: { required },
          nationality: { required },
          birthDate: { required },
          birthCountry: { required },
          birthState: {
            required: requiredIf(() => this.mergedUserProfile.identity.birthCountry === 'FR'),
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
        establishment: { required },
        administrative: {
          identityDocs: { required },
          emergencyContact: {
            name: { required },
            phoneNumber: { required, frPhoneNumber },
          },
          idCardRecto: {
            driveId: { required: requiredIf(() => this.mergedUserProfile.administrative.identityDocs === 'cni') },
          },
          passport: {
            driveId: { required: requiredIf(() => this.mergedUserProfile.administrative.identityDocs === 'pp') },
          },
          residencePermitRecto: {
            driveId: { required: requiredIf(() => this.mergedUserProfile.administrative.identityDocs === 'ts') },
          },
          healthAttest: {
            driveId: { required },
          },
          phoneInvoice: {
            driveId: { required },
          },
          payment: {
            rib: {
              iban: { required, iban },
              bic: { required, bic },
            },
          },
          transportInvoice: {
            transportType: { required },
            driveId: { required: requiredIf(item => item.transportType === 'public') },
          },
          mutualFund: {
            has: { required },
            driveId: { required: requiredIf(item => item.has) },
          },
        },
      },
      pictureGroup: this.pictureGroup.map(g => `mergedUserProfile.${g}`),
      identityGroup: this.identityGroup.map(g => `mergedUserProfile.${g}`),
      contactGroup: this.contactGroup.map(g => `mergedUserProfile.${g}`),
      emergencyContactGroup: this.emergencyContactGroup.map(g => `mergedUserProfile.${g}`),
      ibanGroup: this.ibanGroup.map(g => `mergedUserProfile.${g}`),
      documentsGroup: this.documentsGroup.map(g => `mergedUserProfile.${g}`),
      mutualFundGroup: this.mutualFundGroup.map(g => `mergedUserProfile.${g}`),
      transportInvoiceGroup: this.transportInvoiceGroup.map(g => `mergedUserProfile.${g}`),
    }
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    ...mapGetters({ clientRole: 'main/clientRole' }),
    captionTransportUploader () {
      const coachText = 'Justificatif d\'abonnement';
      const auxiliaryText = 'Merci de nous transmettre ton justificatif d\'abonnement';

      return this.isAuxiliary ? auxiliaryText : coachText;
    },
    userProfile () {
      return this.$store.getters['rh/getUserProfile'] || this.loggedUser;
    },
    nationalitiesOptions () {
      return ['FR', ...Object.keys(nationalities).filter(nationality => nationality !== 'FR')]
        .map(nationality => ({ value: nationality, label: nationalities[nationality] }));
    },
    countriesOptions () {
      return ['FR', ...Object.keys(countries).filter(country => country !== 'FR')]
        .map(country => ({ value: country, label: countries[country] }));
    },
    docsUploadUrl () {
      const driveId = get(this.mergedUserProfile, 'administrative.driveFolder.driveId');
      if (!driveId) return '';

      return `${process.env.API_HOSTNAME}/users/${this.mergedUserProfile._id}/gdrive/${driveId}/upload`;
    },
    pictureUploadUrl () {
      return `${process.env.API_HOSTNAME}/users/${this.mergedUserProfile._id}/cloudinary/upload`;
    },
    hasPicture () {
      return !!this.pictureLink;
    },
    pictureLink () {
      return get(this.mergedUserProfile, 'picture.link') || null;
    },
    birthStateError () {
      const { required, minLength, maxLength, numeric } = this.$v.mergedUserProfile.identity.birthState
      if (!required) return REQUIRED_LABEL;
      else if (!minLength || !maxLength || !numeric) return 'Departement non valide';

      return '';
    },
    ssnError () {
      const { required, minLength, maxLength, numeric } = this.$v.mergedUserProfile.identity.socialSecurityNumber;

      if (!required) return REQUIRED_LABEL;
      else if (!minLength || !maxLength || !numeric) return 'Numéro de sécurité sociale non valide';

      return '';
    },
    zipCodeError () {
      const { required, frZipCode, maxLength } = this.$v.mergedUserProfile.contact.zipCode;

      if (!required) return REQUIRED_LABEL;
      else if (!frZipCode || !maxLength) return 'Code postal non valide';

      return '';
    },
    emergencyPhoneNbrError () {
      const { required, frPhoneNumber, maxLength } = this.$v.mergedUserProfile.administrative.emergencyContact.phoneNumber;

      if (!required) return REQUIRED_LABEL;
      else if (!frPhoneNumber || !maxLength) return 'Numéro de téléphone non valide';

      return '';
    },
    ibanError () {
      const { required, iban } = this.$v.mergedUserProfile.administrative.payment.rib.iban;

      if (!required) return REQUIRED_LABEL;
      else if (!iban) return 'IBAN non valide';

      return '';
    },
    bicError () {
      const { required, bic } = this.$v.mergedUserProfile.administrative.payment.rib.bic;

      if (!required) return REQUIRED_LABEL;
      else if (!bic) return 'BIC non valide';

      return '';
    },
    addressError () {
      return !this.$v.mergedUserProfile.contact.address.fullAddress.required ? REQUIRED_LABEL : 'Adresse non valide';
    },
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.clientRole);
    },
    isCoach () {
      return COACH_ROLES.includes(this.clientRole);
    },
    establishmentsOptions () {
      return [
        { label: 'Non affecté', value: null, inactive: true },
        ...this.establishments.map(est => ({ label: est.name, value: est._id, inactive: false })),
      ];
    },
    hasMutual () {
      return get(this.mergedUserProfile, 'administrative.mutualFund.has');
    },
  },
  async created () {
    this.mergeUser(this.userProfile);
    if (this.isCoach) await Promise.all([this.getAuxiliaryRoles(), this.getEstablishments()]);
    this.$v.mergedUserProfile.$touch();
    this.isLoaded = true;
  },
  watch: {
    userProfile (value) {
      if (this.emailLock && !isEqual(value, this.mergedUserProfile)) this.mergeUser(value);
    },
  },
  methods: {
    mergeUser (value = null) {
      const args = [this.mergedUserProfile, value];
      this.mergedUserProfile = Object.assign({}, extend(true, ...args));
    },
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = get(this.mergedUserProfile, path);
    },
    async updateAlenviUser (path) {
      let value = get(this.mergedUserProfile, path);
      if (path.match(/iban/i)) value = value.split(' ').join('');

      const payload = set({}, path, value);
      if (path === 'role.client._id') payload.role = value;
      if (path.match(/birthCountry/i) && value !== 'FR') {
        this.mergedUserProfile.identity.birthState = '99';
        payload.identity.birthState = '99';
      }

      await Users.updateById(this.mergedUserProfile._id, payload);
      this.$store.dispatch('rh/setUserProfile', this.mergedUserProfile);
    },
    async uploadImage () {
      try {
        if (this.hasPicture && !this.fileChosen) {
          await cloudinary.deleteImageById({ id: this.mergedUserProfile.picture.publicId });
        }
        this.loadingImage = true;
        const blob = await this.croppa.promisedBlob('image/jpeg', 0.8);
        const data = new FormData();
        data.append('_id', this.mergedUserProfile._id);
        data.append('role', this.mergedUserProfile.role.client.name);
        data.append('fileName', `photo_${this.mergedUserProfile.identity.firstname}_${this.mergedUserProfile.identity.lastname}`);
        data.append('Content-Type', blob.type || 'application/octet-stream');
        data.append('picture', blob);

        await this.$axios.post(
          this.pictureUploadUrl,
          data,
          { headers: { 'content-type': 'multipart/form-data', 'x-access-token': Cookies.get('alenvi_token') || '' } }
        );
        await this.$store.dispatch('rh/fetchUserProfile', { userId: this.mergedUserProfile._id });
        this.closePictureEdition();
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.loadingImage = false;
      }
    },
    documentTitle (path) {
      return `${path}_${this.mergedUserProfile.identity.firstname}_${this.mergedUserProfile.identity.lastname}`;
    },
    async deleteDocument (path) {
      try {
        const payload = set({}, path, { driveId: null, link: null });
        await Users.updateById(this.mergedUserProfile._id, payload);
        await gdrive.removeFileById({ id: get(this.mergedUserProfile, `${path}.driveId`) });

        await this.$store.dispatch('rh/fetchUserProfile', { userId: this.mergedUserProfile._id });
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    validateDocumentDeletion (path) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteDocument(path))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteCertificate (driveId) {
      try {
        await Users.updateCertificates(this.mergedUserProfile._id, { certificates: { driveId } });
        await gdrive.removeFileById({ id: driveId });

        await this.$store.dispatch('rh/fetchUserProfile', { userId: this.mergedUserProfile._id });
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    validateCertificateDeletion (driveId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteCertificate(driveId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteImage () {
      try {
        if (this.mergedUserProfile.picture && this.mergedUserProfile.picture.publicId) {
          await cloudinary.deleteImageById({ id: this.mergedUserProfile.picture.publicId });
          this.croppa.remove();
        }
        await Users.updateById(this.mergedUserProfile._id, { picture: { link: null, publicId: null } });
        await this.$store.dispatch('rh/fetchUserProfile', { userId: this.mergedUserProfile._id });
        NotifyPositive('Photo supprimée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de la photo.');
      }
    },
    validateImageDeletion () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ta photo ?',
        ok: true,
        cancel: 'Annuler',
      })
        .onOk(this.deleteImage)
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async refreshUser () {
      await this.$store.dispatch('rh/fetchUserProfile', { userId: this.mergedUserProfile._id });
      NotifyPositive('Document envoyé');
    },
    groupErrors (group) {
      let j = 0;
      const groupName = `${group}Group`;
      for (let i = 0, l = this[groupName].length; i < l; i++) {
        if (this.$v[groupName][`mergedUserProfile.${this[groupName][i]}`].$error) j++;
      }

      return { errors: j, msg: j > 0 ? `${j} information(s) manquante(s)` : 'Informations complètes' };
    },
    groupErrorsClass (group) {
      return this.groupErrors(group).errors > 0 ? 'group-error' : 'group-error-ok';
    },
    choosePicture () {
      this.fileChosen = true;
      this.disablePictureEdition = false;
      this.croppa.chooseFile();
    },
    closePictureEdition () {
      this.disablePictureEdition = true;
      this.fileChosen = false;
      if (!this.hasPicture && !this.fileChosen) this.croppa.remove();
      if (this.hasPicture && !this.fileChosen) this.croppa.refresh();
    },
    pictureDlLink (link) {
      const lastname = removeDiacritics(get(this.mergedUserProfile, 'identity.lastname'));
      const firstname = removeDiacritics(get(this.mergedUserProfile, 'identity.firstname'));

      return link ? link.replace(/(\/upload)/i, `$1/fl_attachment:photo_${firstname}_${lastname}`) : '';
    },
    async getAuxiliaryRoles () {
      try {
        const roles = await Roles.list({ name: [AUXILIARY, PLANNING_REFERENT] });
        this.auxiliaryRolesOptions = roles.map((role) => ({
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
}
</script>

<style lang="stylus" scoped>
  .q-btn-group
    & /deep/ button
      flex: 1
  .group-error
    font-size: 12px
    color: $secondary
    &-ok
      font-size: 12px
      color: $accent
</style>
