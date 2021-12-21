<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal :disable="!firstStep" :value="newUser.local.email" caption="Email"
      :error="validations.local.email.$error" @blur="validations.local.email.$touch" required-field
      :error-message="emailError" @input="updateUser($event.trim(), 'local.email')" />
    <template v-if="!firstStep">
      <ni-select in-modal :value="newUser.identity.title" :options="civilityOptions" caption="Civilité"
        required-field :error="validations.identity.title.$error" @blur="validations.identity.title.$touch"
        @input="updateUser($event, 'identity.title')" />
      <ni-input in-modal :value="newUser.identity.lastname" :error="validations.identity.lastname.$error" caption="Nom"
        @blur="validations.identity.lastname.$touch" required-field
        @input="updateUser($event.trim(), 'identity.lastname')" />
      <ni-input in-modal :value="newUser.identity.firstname" :error="validations.identity.firstname.$error"
        caption="Prénom" @blur="validations.identity.firstname.$touch" required-field
        @input="updateUser($event.trim(), 'identity.firstname')" />
      <ni-input in-modal :value="newUser.contact.phone" :error="validations.contact.phone.$error" required-field
        caption="Numéro de téléphone" @blur="validations.contact.phone.$touch" :error-message="mobilePhoneError"
        @input="updateUser($event, 'contact.phone')" />
      <ni-search-address :value="newUser.contact.address" color="white" inverted-light
        @blur="validations.contact.address.$touch" error-message="Adresse non valide"
        :error="validations.contact.address.$error" in-modal @input="updateUser($event, 'contact.address')" />
      <ni-select-sector :value="newUser.sector" @blur="validations.sector.$touch" :error-message="REQUIRED_LABEL"
        :company-id="companyId" :error="validations.sector.$error" in-modal @input="updateUser($event, 'sector')"
        required-field />
      <div class="row margin-input last">
        <q-checkbox :value="sendWelcomeMsg" label="Envoyer SMS d'accueil" dense @input="updateSendWelcome" />
      </div>
    </template>
    <template slot="footer">
      <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary"
        :loading="loading" icon-right="add" @click="goToNextStep" />
      <q-btn v-else no-caps class="full-width modal-btn" label="Ajouter la personne" color="primary"
        :loading="loading" icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import SearchAddress from '@components/form/SearchAddress';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import SelectSector from '@components/form/SelectSector';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'AuxiliaryCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newUser: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    civilityOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: false },
    sendWelcomeMsg: { type: Boolean, default: false },
    emailError: { type: String, default: '' },
    companyId: { type: String, default: '' },
  },
  components: {
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-select-sector': SelectSector,
  },
  data () {
    return {
      REQUIRED_LABEL,
    };
  },
  computed: {
    mobilePhoneError () {
      if (!this.validations.contact.phone.required) {
        return REQUIRED_LABEL;
      } if (!this.validations.contact.phone.frPhoneNumber || !this.validations.contact.phone.maxLength) {
        return 'Numéro de téléphone non valide';
      }
      return '';
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    goToNextStep () {
      this.$emit('go-to-next-step');
    },
    updateSendWelcome (event) {
      this.$emit('update:send-welcome-msg', event);
    },
    updateUser (value, path) {
      this.$emit('update-new-user', { value, path });
    },
  },
};
</script>
