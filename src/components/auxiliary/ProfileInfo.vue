<template>
  <div v-if="isLoaded">
    <div v-if="!isAuxiliary" class="row gutter-profile q-mb-xl">
      <div class="col-xs-12 col-md-6">
        <p class="input-caption">Équipe</p>
        <ni-select-sector v-model="user.sector" @blur="updateUser('sector')" @focus="saveTmp('sector')"
          :company-id="mainUser.company._id" in-form />
      </div>
      <ni-input v-model="user.mentor" caption="Marraine/parrain" @focus="saveTmp('mentor')"
        @blur="updateUser('mentor')" />
      <ni-select v-model="user.role._id" caption="Rôle" :options="auxiliaryRolesOptions" @focus="saveTmp('role._id')"
        @blur="updateUser('role._id')" in-form />
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Photo</p>
        <p :class="[groupErrors('picture').errors > 0 ? 'group-error' : 'group-error-ok']">
          {{groupErrors('picture').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <div class="row" style="background: white">
            <div class="row justify-center col-xs-12" style="padding: 12px 0px;">
              <croppa v-model="croppa" canvas-color="#EEE" accept="image/*" :initial-image="hasPicture"
                :prevent-white-space="true" placeholder="Clique ici pour choisir ta photo" placeholder-color="black"
                :placeholder-font-size="10" :show-remove-button="false" :disable-drag-and-drop="disablePictureEdition"
                :disable-drag-to-move="disablePictureEdition" :disable-scroll-to-zoom="disablePictureEdition"
                :disable-pinch-to-zoom="disablePictureEdition" @file-choose="choosePicture" />
            </div>
            <div class="row justify-center col-xs-12">
              <q-btn v-if="disablePictureEdition && hasPicture" color="primary" round flat
                icon="mdi-square-edit-outline" size="1rem" @click="disablePictureEdition = false" />
              <q-btn v-if="disablePictureEdition && hasPicture" color="primary" round flat icon="delete" size="1rem"
                @click="deleteImage" />
              <q-btn v-if="!disablePictureEdition" color="primary" icon="clear" @click="closePictureEdition" round flat
                size="1rem" />
              <q-btn v-if="!disablePictureEdition" color="primary" icon="rotate left" @click="croppa.rotate(-1)" round
                flat size="1rem" />
              <q-btn v-if="!disablePictureEdition" color="primary" icon="rotate right" @click="croppa.rotate(1)" round
                flat size="1rem" />
              <q-btn v-if="!disablePictureEdition" :loading="loadingImage" color="primary" icon="done"
                @click="uploadImage" round flat size="1rem" />
              <a :href="pictureDlLink(hasPicture)" target="_blank">
                <q-btn v-if="hasPicture && disablePictureEdition" color="primary" round flat icon="save_alt"
                  size="1rem" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
        <p :class="[groupErrors('identity').errors > 0 ? 'group-error' : 'group-error-ok']">{{
          groupErrors('identity').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom" :error="$v.user.identity.firstname.$error" v-model.trim="user.identity.firstname"
          @blur="updateUser('identity.firstname')" @focus="saveTmp('identity.firstname')" />
        <ni-input caption="Nom" :error="$v.user.identity.lastname.$error" v-model.trim="user.identity.lastname"
          @blur="updateUser('identity.lastname')" @focus="saveTmp('identity.lastname')" />
        <ni-select caption="Nationalité" :error="$v.user.identity.nationality.$error" :options="nationalitiesOptions"
          v-model="user.identity.nationality" @focus="saveTmp('identity.nationality')" in-form
          @blur="updateUser('identity.nationality')" />
        <ni-date-input caption="Date de naissance" :error="$v.user.identity.birthDate.$error"
          v-model="user.identity.birthDate" @focus="saveTmp('identity.birthDate')" content-class="col-xs-12 col-md-6"
          @input="updateUser('identity.birthDate')" />
        <ni-select caption="Pays de naissance" :error="$v.user.identity.birthCountry.$error" :options="countriesOptions"
          v-model="user.identity.birthCountry" @focus="saveTmp('identity.birthCountry')" in-form
          @blur="updateUser('identity.birthCountry')" />
        <ni-input caption="Département de naissance" :error="$v.user.identity.birthState.$error"
          :error-label="birthStateError" v-model="user.identity.birthState" @blur="updateUser('identity.birthState')"
          @focus="saveTmp('identity.birthState')" :hidden="this.user.identity.birthCountry !== 'FR'" />
        <ni-input caption="Ville de naissance" :error="$v.user.identity.birthCity.$error"
          v-model="user.identity.birthCity" @focus="saveTmp('identity.birthCity')"
          @blur="updateUser('identity.birthCity')" />
        <ni-input caption="Numéro de sécurité sociale" :error="$v.user.identity.socialSecurityNumber.$error"
          v-model="user.identity.socialSecurityNumber" @focus="saveTmp('identity.socialSecurityNumber')"
          @blur="updateUser('identity.socialSecurityNumber')" :error-label="ssnError" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
        <p :class="[groupErrors('contact').errors > 0 ? 'group-error' : 'group-error-ok']">
          {{ groupErrors('contact').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Numéro de téléphone" :error="$v.user.contact.phone.$error" :error-label="phoneNbrError"
          type="tel" v-model.trim="user.contact.phone" @blur="updateUser('contact.phone')"
          @focus="saveTmp('contact.phone')" />
        <div v-if="!isAuxiliary" class="col-12 col-md-6 row items-center">
          <div class="col-xs-11">
            <ni-input ref="userEmail" :name="emailInputRef" caption="Adresse email" :error="$v.user.local.email.$error"
              :error-label="emailError" type="email" lower-case :disable="emailLock" v-model.trim="user.local.email"
              @focus="saveTmp('local.email')" />
          </div>
          <div :class="['col-xs-1', 'row', 'justify-end', { 'cursor-pointer': emailLock }]">
            <q-icon size="1.5rem" :name="lockIcon" @click.native="toggleEmailLock(!emailLock)" />
          </div>
        </div>
        <ni-search-address v-model="user.contact.address" color="white" @focus="saveTmp('contact.address.fullAddress')"
          @blur="updateUser('contact.address')" :error-label="addressError" :error="$v.user.contact.address.$error" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact d'urgence</p>
        <p :class="[groupErrors('emergencyContact').errors > 0 ? 'group-error' : 'group-error-ok']">
          {{ groupErrors('emergencyContact').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom et nom" :error="$v.user.administrative.emergencyContact.name.$error"
          v-model="user.administrative.emergencyContact.name" @focus="saveTmp('administrative.emergencyContact.name')"
          @blur="updateUser('administrative.emergencyContact.name')" />
        <ni-input caption="Numéro de téléphone" :error="$v.user.administrative.emergencyContact.phoneNumber.$error"
          v-model.trim="user.administrative.emergencyContact.phoneNumber"
          @focus="saveTmp('administrative.emergencyContact.phoneNumber')"
          @blur="updateUser('administrative.emergencyContact.phoneNumber')" :error-label="emergencyPhoneNbrError" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">IBAN</p>
        <p :class="[groupErrors('iban').errors > 0 ? 'group-error' : 'group-error-ok']">{{ groupErrors('iban').msg }}
        </p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="IBAN" :error="$v.user.administrative.payment.rib.iban.$error" :error-label="ibanError"
          v-model="user.administrative.payment.rib.iban" @focus="saveTmp('administrative.payment.rib.iban')" upper-case
          @blur="updateUser('administrative.payment.rib.iban')" />
        <ni-input caption="BIC" :error="$v.user.administrative.payment.rib.bic.$error" :error-label="bicError"
          upper-case v-model.trim="user.administrative.payment.rib.bic"
          @focus="saveTmp('administrative.payment.rib.bic')" @blur="updateUser('administrative.payment.rib.bic')" />
      </div>
    </div>
    <div v-if="user.administrative.driveFolder" class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Documents</p>
        <p :class="[groupErrors('documents').errors > 0 ? 'group-error' : 'group-error-ok']">
          {{groupErrors('documents').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12">
          <ni-option-group :display-caption="isAuxiliary" v-model="user.administrative.identityDocs" type="radio"
            :options="identityDocsOptions" :error="$v.user.administrative.identityDocs.$error"
            caption="Merci de nous indiquer le type de document d'identité que tu possèdes." required-field
            :error-label="requiredLabel" @input="updateUser('administrative.identityDocs')" />
        </div>
        <div v-if="user.administrative.identityDocs === 'cni'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Carte d'identité (recto)" path="administrative.idCardRecto" alt="cni recto"
            :entity="currentUser" name="idCardRecto" @uploaded="refreshUser" :url="docsUploadUrl"
            @delete="deleteDocument(user.administrative.idCardRecto.driveId, 'administrative.idCardRecto')"
            :error="$v.user.administrative.idCardRecto.driveId.$error" :extensions="extensions"
            :additional-value="`cni_recto_${currentUser.identity.firstname}_${currentUser.identity.lastname}`"/>
        </div>
        <div v-if="user.administrative.identityDocs === 'cni'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Carte d'identité (verso)" path="administrative.idCardVerso" alt="cni verso"
            :entity="currentUser" :url="docsUploadUrl" name="idCardVerso" @uploaded="refreshUser"
            @delete="deleteDocument(user.administrative.idCardVerso.driveId, 'administrative.idCardVerso')"
             :extensions="extensions"
            :additional-value="`cni_verso_${currentUser.identity.firstname}_${currentUser.identity.lastname}`"/>
        </div>
        <div v-if="user.administrative.identityDocs === 'pp'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Passeport" path="administrative.passport" alt="passeport" :entity="currentUser"
            @delete="deleteDocument(user.administrative.passport.driveId, 'administrative.passport')" name="passport"
            :url="docsUploadUrl" @uploaded="refreshUser" :error="$v.user.administrative.passport.driveId.$error"
            :extensions="extensions"
            :additional-value="`passport_${currentUser.identity.firstname}_${currentUser.identity.lastname}`" />
        </div>
        <div v-if="user.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Titre de séjour (recto)" path="administrative.residencePermitRecto"
            alt="titre de séjour (recto)" :entity="currentUser" @uploaded="refreshUser" :url="docsUploadUrl"
            @delete="deleteDocument(user.administrative.residencePermitRecto.driveId, 'administrative.residencePermitRecto')"
            :error="$v.user.administrative.residencePermitRecto.driveId.$error" name="residencePermitRecto"
            :additional-value="`titre_de_séjour_recto_${currentUser.identity.firstname}_${currentUser.identity.lastname}`"
            :extensions="extensions" />
        </div>
        <div v-if="user.administrative.identityDocs === 'ts'" class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Titre de séjour (verso)" path="administrative.residencePermitVerso"
            alt="titre de séjour (verso)" name="residencePermitVerso"
            @delete="deleteDocument(user.administrative.residencePermitVerso.driveId, 'administrative.residencePermitVerso')"
            :entity="currentUser" @uploaded="refreshUser" :url="docsUploadUrl" :extensions="extensions"
            :additional-value="`titre_de_séjour_verso_${currentUser.identity.firstname}_${currentUser.identity.lastname}`" />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Attestation de sécurité sociale" path="administrative.healthAttest"
            alt="attestation secu" :entity="currentUser" :url="docsUploadUrl" :extensions="extensions"
            @delete="deleteDocument(user.administrative.healthAttest.driveId, 'administrative.healthAttest')"
            name="healthAttest" @uploaded="refreshUser" :error="$v.user.administrative.healthAttest.driveId.$error"
            :additional-value="`attestation_secu_${currentUser.identity.firstname}_${currentUser.identity.lastname}`" />
        </div>
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Facture téléphonique" path="administrative.phoneInvoice" alt="facture téléphone"
            :entity="currentUser" :url="docsUploadUrl" :extensions="extensions"
            @delete="deleteDocument(user.administrative.phoneInvoice.driveId, 'administrative.phoneInvoice')"
            name="phoneInvoice" @uploaded="refreshUser" :error="$v.user.administrative.phoneInvoice.driveId.$error"
            :additional-value="`facture_telephone_${currentUser.identity.firstname}_${currentUser.identity.lastname}`"/>
        </div>
        <div class="col-xs-12">
          <ni-multiple-files-uploader caption="Diplome(s) ou certificat(s)" path="administrative.certificates"
            alt="facture téléphone" @delete="deleteDocument($event, 'certificates')" name="certificates"
            collapsible-label="Ajouter un diplôme" :user-profile="currentUser" :url="docsUploadUrl"
            additional-fields-name="diplomes" @uploaded="refreshUser" :extensions="extensions" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Mutuelle</p>
        <p :class="[groupErrors('mutualFund').errors > 0 ? 'group-error' : 'group-error-ok']">
          {{ groupErrors('mutualFund').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12">
          <div v-if="isAuxiliary" class="row justify-between">
            <p class="input-caption">Veux-tu adhérer à la mutuelle d'entreprise ?</p>
            <q-icon v-if="$v.user.administrative.mutualFund.has.$error" name="error_outline" color="secondary" />
          </div>
          <q-field dense :error="$v.user.administrative.mutualFund.has.$error" :error-label="requiredLabel">
            <q-btn-toggle class="full-width" color="white" text-color="black" toggle-color="primary"
              v-model="user.administrative.mutualFund.has" @input="updateUser('administrative.mutualFund.has')"
              :options="[
                  { label: 'Oui', value: false },
                  { label: 'Non', value: true }
                ]" />
          </q-field>
        </div>
        <div class="col-xs-12 col-md-6" v-if="$_.get(user, 'administrative.mutualFund.has')">
          <ni-file-uploader
            caption="Merci de nous transmettre une attestation prouvant que tu es déjà affilié(e) à une autre mutuelle"
            path="administrative.mutualFund" alt="justif mutuelle" :entity="currentUser"
            @delete="deleteDocument(user.administrative.mutualFund.driveId, 'administrative.mutualFund')"
            name="mutualFund" @uploaded="refreshUser" :url="docsUploadUrl" :extensions="extensions"
            entity-url="users" :error="$v.user.administrative.mutualFund.driveId.$error" :display-caption="isAuxiliary"
            :additional-value="`mutuelle_${currentUser.identity.firstname}_${currentUser.identity.lastname}`" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Transports</p>
        <p :class="[groupErrors('transportInvoice').errors > 0 ? 'group-error' : 'group-error-ok']">
          {{ groupErrors('transportInvoice').msg }}</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-xs-12">
          <ni-option-group :display-caption="isAuxiliary" v-model="user.administrative.transportInvoice.transportType"
            :options="transportOptions" caption="Par quel moyen comptes-tu te rendre au travail ?" type="radio"
            :error-label="requiredLabel" :error="$v.user.administrative.transportInvoice.transportType.$error"
            required-field @input="updateUser('administrative.transportInvoice.transportType')" />
        </div>
        <div v-if="user.administrative.transportInvoice.transportType === 'public'" class="col-xs-12 col-md-6">
          <ni-file-uploader :caption="captionTransportUploader" path="administrative.transportInvoice"
            alt="justif transport" :entity="currentUser" name="transportInvoice" @uploaded="refreshUser"
            :error="$v.user.administrative.transportInvoice.driveId.$error" :url="docsUploadUrl"
            :extensions="extensions"
            @delete="deleteDocument(user.administrative.transportInvoice.driveId, 'administrative.transportInvoice')"
            :additional-value="`justif_transport_${currentUser.identity.firstname}_${currentUser.identity.lastname}`" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Visite médicale</p>
      <div class="row gutter-profile">
        <div class="col-xs-12 col-md-6">
          <ni-file-uploader caption="Certificat d'aptitude" path="administrative.medicalCertificate"
            alt="certificat médical" :entity="user" name="medicalCertificate" @uploaded="refreshUser"
            @delete="deleteDocument(user.administrative.medicalCertificate.driveId, 'administrative.medicalCertificate')"
            :additional-value="`certificat_medical_${currentUser.identity.firstname}_${currentUser.identity.lastname}`"
            :url="docsUploadUrl" :extensions="extensions" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { Cookies } from 'quasar';
import { required, email, numeric, minLength, maxLength, requiredIf } from 'vuelidate/lib/validators';
import 'vue-croppa/dist/vue-croppa.css'

import gdrive from '../../api/GoogleDrive.js';
import cloudinary from '../../api/Cloudinary.js';
import nationalities from '../../data/nationalities.js';
import countries from '../../data/countries.js';
import { AUXILIARY, PLANNING_REFERENT, TRANSPORT_OPTIONS, REQUIRED_LABEL } from '../../data/constants.js';
import SelectSector from '../form/SelectSector';
import Input from '../form/Input';
import Select from '../form/Select';
import OptionGroup from '../form/OptionGroup';
import FileUploader from '../form/FileUploader.vue';
import MultipleFilesUploader from '../form/MultipleFilesUploader.vue';
import DateInput from '../form/DateInput.vue';
import SearchAddress from '../form/SearchAddress';
import { frPhoneNumber, iban, frAddress, bic } from '../../helpers/vuelidateCustomVal';
import { extend } from '../../helpers/utils.js';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../popup/notify';
import { validationMixin } from '../../mixins/validationMixin.js';

export default {
  name: 'ProfileInfo',
  mixins: [validationMixin],
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
      emailInputRef: 'emailInput',
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
      pictureGroup: [ 'user.picture.link' ],
      identityGroup: [
        'user.identity.firstname',
        'user.identity.lastname',
        'user.identity.nationality',
        'user.identity.birthDate',
        'user.identity.birthCountry',
        'user.identity.birthState',
        'user.identity.birthCity',
        'user.identity.socialSecurityNumber',
      ],
      contactGroup: [
        'user.contact.address',
        'user.contact.zipCode',
        'user.contact.city',
      ],
      emergencyContactGroup: [
        'user.administrative.emergencyContact.name',
        'user.administrative.emergencyContact.phoneNumber',
      ],
      ibanGroup: [
        'user.administrative.payment.rib.iban',
        'user.administrative.payment.rib.bic',
      ],
      documentsGroup: [
        'user.administrative.identityDocs',
        'user.administrative.idCardRecto.driveId',
        'user.administrative.passport.driveId',
        'user.administrative.residencePermitRecto.driveId',
        'user.administrative.healthAttest.driveId',
        'user.administrative.phoneInvoice.driveId',
      ],
      mutualFundGroup: [
        'user.administrative.mutualFund.has',
        'user.administrative.mutualFund.driveId',
      ],
      transportInvoiceGroup: [
        'user.administrative.transportInvoice.transportType',
        'user.administrative.transportInvoice.driveId',
      ],
      user: {
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
        role: { _id: '' },
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
      },
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
      auxiliaryRolesOptions: [],
      identityDocsOptions: [
        { label: 'Carte Nationale d\'Identité', value: 'cni' },
        { label: 'Passeport', value: 'pp' },
        { label: 'Titre de séjour', value: 'ts' },
      ],
    }
  },
  validations () {
    return {
      identityType: { required },
      user: {
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
            required: requiredIf(() => this.user.identity.birthCountry === 'FR'),
            numeric,
            minLength: minLength(2),
            maxLength: maxLength(3),
          },
          birthCity: { required },
          socialSecurityNumber: {
            required,
            numeric,
            minLength: minLength(15),
            maxLength: maxLength(15),
          },
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
        administrative: {
          identityDocs: { required },
          emergencyContact: {
            name: { required },
            phoneNumber: { required, frPhoneNumber },
          },
          idCardRecto: {
            driveId: {
              required: requiredIf(() => this.user.administrative.identityDocs === 'cni'),
            },
          },
          passport: {
            driveId: {
              required: requiredIf(() => this.user.administrative.identityDocs === 'pp'),
            },
          },
          residencePermitRecto: {
            driveId: {
              required: requiredIf(() => this.user.administrative.identityDocs === 'ts'),
            },
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
      pictureGroup: this.pictureGroup,
      identityGroup: this.identityGroup,
      contactGroup: this.contactGroup,
      emergencyContactGroup: this.emergencyContactGroup,
      ibanGroup: this.ibanGroup,
      documentsGroup: this.documentsGroup,
      mutualFundGroup: this.mutualFundGroup,
      transportInvoiceGroup: this.transportInvoiceGroup,
    }
  },
  computed: {
    captionTransportUploader () {
      const coachText = 'Justificatif d\'abonnement';
      const auxiliaryText = 'Merci de nous transmettre ton justificatif d\'abonnement'
      return this.isAuxiliary ? auxiliaryText : coachText;
    },
    ...mapGetters({
      userProfile: 'rh/getUserProfile',
      mainUser: 'main/user',
    }),
    currentUser () {
      return this.userProfile ? this.userProfile : this.mainUser;
    },
    nationalitiesOptions () {
      return ['FR', ...Object.keys(nationalities).filter(nationality => nationality !== 'FR')].map(nationality => ({ value: nationality, label: nationalities[nationality] }));
    },
    countriesOptions () {
      return ['FR', ...Object.keys(countries).filter(country => country !== 'FR')].map(country => ({ value: country, label: countries[country] }));
    },
    docsUploadUrl () {
      const driveId = this.$_.get(this.currentUser, 'administrative.driveFolder.driveId');
      if (!driveId) return '';

      return `${process.env.API_HOSTNAME}/users/${this.currentUser._id}/gdrive/${driveId}/upload`;
    },
    pictureUploadUrl () {
      return `${process.env.API_HOSTNAME}/users/${this.currentUser._id}/cloudinary/upload`;
    },
    hasPicture () {
      return !this.user.picture || (this.user.picture && !this.user.picture.link) ? null : this.user.picture.link;
    },
    birthStateError () {
      if (!this.$v.user.identity.birthState.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.user.identity.birthState.minLength ||
      !this.$v.user.identity.birthState.maxLength ||
      !this.$v.user.identity.birthState.numeric) {
        return 'Departement non valide';
      }
      return '';
    },
    ssnError () {
      if (!this.$v.user.identity.socialSecurityNumber.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.user.identity.socialSecurityNumber.minLength ||
      !this.$v.user.identity.socialSecurityNumber.maxLength ||
      !this.$v.user.identity.socialSecurityNumber.numeric) {
        return 'Numéro de sécurité sociale non valide';
      }
      return '';
    },
    phoneNbrError () {
      if (!this.$v.user.contact.phone.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.user.contact.phone.frPhoneNumber || !this.$v.user.contact.phone.maxLength) {
        return 'Numéro de téléphone non valide';
      }
      return '';
    },
    emailError () {
      if (!this.$v.user.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.user.local.email.email) {
        return 'Email non valide';
      }
      return '';
    },
    zipCodeError () {
      if (!this.$v.user.contact.zipCode.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.user.contact.zipCode.frZipCode || !this.$v.user.contact.zipCode.maxLength) {
        return 'Code postal non valide';
      }
      return '';
    },
    emergencyPhoneNbrError () {
      if (!this.$v.user.administrative.emergencyContact.phoneNumber.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.user.administrative.emergencyContact.phoneNumber.frPhoneNumber || !this.$v.user.administrative.emergencyContact.phoneNumber.maxLength) {
        return 'Numéro de téléphone non valide';
      }
      return '';
    },
    ibanError () {
      if (!this.$v.user.administrative.payment.rib.iban.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.user.administrative.payment.rib.iban.iban) {
        return 'IBAN non valide';
      }
      return '';
    },
    bicError () {
      if (!this.$v.user.administrative.payment.rib.bic.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.user.administrative.payment.rib.bic.bic) {
        return 'BIC non valide';
      }
      return '';
    },
    addressError () {
      if (!this.$v.user.contact.address.fullAddress.required) {
        return REQUIRED_LABEL;
      }
      return 'Adresse non valide';
    },
    isAuxiliary () {
      return this.mainUser.role.name === AUXILIARY || this.mainUser.role.name === PLANNING_REFERENT;
    },
    lockIcon () {
      return this.emailLock ? 'lock' : 'lock_open';
    },
  },
  async mounted () {
    const user = await this.$users.getById(this.currentUser._id);
    this.mergeUser(user);
    if (!this.isAuxiliary) await this.getAuxiliaryRoles();
    this.$v.user.$touch();
    this.isLoaded = true;
  },
  watch: {
    currentUser (value) {
      if (this.emailLock && !this.$_.isEqual(value, this.user)) {
        this.mergeUser(value);
      }
    },
  },
  methods: {
    async toggleEmailLock (toLock) {
      if (!toLock) {
        this.emailLock = false;
        await this.$nextTick();
        this.$refs.userEmail.$refs.emailInput.focus();
      } else {
        await this.updateUser('local.email');
      }
    },
    mergeUser (value = null) {
      const args = [this.user, value];
      this.user = Object.assign({}, extend(true, ...args));
    },
    saveTmp (path) {
      if (this.tmpInput === '') this.tmpInput = this.$_.get(this.user, path);
    },
    async emailErrorHandler (path) {
      try {
        NotifyNegative('Email déjà existant');
        this.user.local.email = this.currentUser.local.email;
        await this.$nextTick();
        this.$refs.userEmail.select();
      } catch (e) {
        console.error(e);
      }
    },
    async updateUser (path) {
      try {
        if (this.tmpInput === this.$_.get(this.user, path)) {
          this.emailLock = true;
          return;
        }

        if (this.$_.get(this.$v.user, path)) {
          this.$_.get(this.$v.user, path).$touch();
          const isValid = await this.waitForValidation(this.$v.user, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }
        await this.updateAlenviUser(path);

        this.$store.commit('rh/saveUserProfile', this.user);
        this.emailLock = true;
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return this.emailErrorHandler(path);
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
      }
    },
    async updateAlenviUser (path) {
      let value = this.$_.get(this.user, path);
      if (path.match(/iban/i)) value = value.split(' ').join('');

      const payload = this.$_.set({}, path, value);
      payload._id = this.currentUser._id;
      if (path === 'role._id') payload.role = value;
      if (path.match(/birthCountry/i) && value !== 'FR') {
        this.user.identity.birthState = '99';
        payload.identity.birthState = '99';
      }
      await this.$users.updateById(payload);
    },
    async uploadImage () {
      try {
        if (this.hasPicture && !this.fileChosen) {
          await cloudinary.deleteImageById({ id: this.currentUser.picture.publicId });
        }
        this.loadingImage = true;
        let blob = await this.croppa.promisedBlob('image/jpeg', 0.8);
        let data = new FormData();
        data.append('_id', this.currentUser._id);
        data.append('role', this.currentUser.role.name);
        data.append('fileName', `photo_${this.currentUser.identity.firstname}_${this.currentUser.identity.lastname}`);
        data.append('Content-Type', blob.type || 'application/octet-stream');
        data.append('picture', blob);
        await this.$axios.post(this.pictureUploadUrl, data, { headers: { 'content-type': 'multipart/form-data', 'x-access-token': Cookies.get('alenvi_token') || '' } });
        await this.$store.dispatch('rh/getUserProfile', { userId: this.currentUser._id });
        this.closePictureEdition();
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.loadingImage = false;
      }
    },
    async deleteDocument (driveId, path) {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler',
        }).onOk(async () => {
          await gdrive.removeFileById({ id: driveId });
          let payload = { _id: this.currentUser._id };
          if (path === 'certificates') {
            payload = Object.assign(payload, { [`administrative.${path}`]: { driveId } });
            await this.$users.updateCertificates(payload);
          } else {
            payload = this.$_.set(payload, path, { driveId: null, link: null });
            await this.$users.updateById(payload);
          }
          await this.$store.dispatch('rh/getUserProfile', { userId: this.currentUser._id });
          NotifyPositive('Document supprimé');
        }).onCancel(() => NotifyPositive('Suppression annulée'));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    async deleteImage (params) {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ta photo ?',
          ok: true,
          cancel: 'Annuler',
        }).onOk(async () => {
          if (this.currentUser.picture && this.currentUser.picture.publicId) {
            await cloudinary.deleteImageById({ id: this.currentUser.picture.publicId });
            this.croppa.remove();
          }
          await this.$users.updateById({
            _id: this.currentUser._id,
            picture: { link: null, publicId: null },
          });
          await this.$store.dispatch('rh/getUserProfile', { userId: this.currentUser._id });
          NotifyPositive('Photo supprimée');
        }).onCancel(() => NotifyPositive('Suppression annulée'));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de la photo');
      }
    },
    async refreshUser () {
      await this.$store.dispatch('rh/getUserProfile', { userId: this.currentUser._id });
      NotifyPositive('Document envoyé');
    },
    groupErrors (group) {
      let j = 0;
      const groupName = `${group}Group`;
      for (let i = 0, l = this[groupName].length; i < l; i++) {
        if (this.$v[groupName][this[groupName][i]].$error) {
          j++;
        }
      }
      return {
        errors: j,
        msg: j > 0 ? `${j} information(s) manquante(s)` : 'Informations complètes',
      };
    },
    choosePicture () {
      this.fileChosen = true;
      this.disablePictureEdition = false;
      this.croppa.chooseFile();
    },
    closePictureEdition () {
      this.disablePictureEdition = true;
      this.fileChosen = false;
      if (!this.hasPicture && !this.fileChosen) {
        this.croppa.remove();
      }
      if (this.hasPicture && !this.fileChosen) {
        this.croppa.refresh();
      }
    },
    pictureDlLink (link) {
      return link ? link.replace(/(\/upload)/i, `$1/fl_attachment:photo_${this.currentUser.identity.firstname}_${this.currentUser.identity.lastname}`) : '';
    },
    async getAuxiliaryRoles () {
      try {
        const roles = await this.$roles.showAll({ name: [AUXILIARY, PLANNING_REFERENT] });
        this.auxiliaryRolesOptions = roles.map((role) => ({
          label: role.name === AUXILIARY ? 'Auxiliaire' : 'Référent(e) planning',
          value: role._id,
        }));
      } catch (e) {
        console.error(e);
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-btn-group
    box-shadow: none
    & /deep/ button
      flex: 1
  .group-error
    font-size: 12px
    color: $secondary
    &-ok
      font-size: 12px
      color: $accent
  .picture-container
     width: 200px
     height: 200px
     background: $neutral
  /deep/.q-field--standard .q-field__control::before
    border-bottom: none !important
  /deep/.q-field--standard .q-field__control::after
    background: none !important
</style>
