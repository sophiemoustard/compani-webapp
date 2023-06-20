<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal :disable="!firstStep" :model-value="newUser.local.email" caption="Email"
      :error="validations.local.email.$error" @blur="validations.local.email.$touch" required-field
      :error-message="emailError" @update:model-value="updateUser($event.trim(), 'local.email')" />
    <template v-if="!firstStep">
      <ni-select in-modal :model-value="newUser.identity.title" :options="civilityOptions" caption="Civilité"
        required-field :error="validations.identity.title.$error" @blur="validations.identity.title.$touch"
        @update:model-value="updateUser($event, 'identity.title')" />
      <ni-input in-modal :model-value="newUser.identity.lastname" :error="validations.identity.lastname.$error"
        @blur="validations.identity.lastname.$touch" required-field caption="Nom"
        @update:model-value="updateUser($event.trim(), 'identity.lastname')" />
      <ni-input in-modal :model-value="newUser.identity.firstname" :error="validations.identity.firstname.$error"
        caption="Prénom" @blur="validations.identity.firstname.$touch" required-field
        @update:model-value="updateUser($event.trim(), 'identity.firstname')" />
      <ni-input in-modal :model-value="newUser.contact.phone" :error="validations.contact.phone.$error" required-field
        caption="Numéro de téléphone" @blur="validations.contact.phone.$touch" :error-message="mobilePhoneError"
        @update:model-value="updateUser($event, 'contact.phone')" />
      <ni-search-address :model-value="newUser.contact.address" color="white" error-message="Adresse non valide"
        @blur="validations.contact.address.$touch" :error="validations.contact.address.$error" in-modal inverted-light
         @update:model-value="updateUser($event, 'contact.address')" />
      <ni-select-sector :model-value="newUser.sector" @blur="validations.sector.$touch" :error-message="REQUIRED_LABEL"
        :error="validations.sector.$error" @update:model-value="updateUser($event, 'sector')" required-field in-modal />
      <div class="row margin-input last">
        <q-checkbox :model-value="sendWelcomeMsg" label="Envoyer SMS d'accueil" @update:model-value="updateSendWelcome"
          dense />
      </div>
    </template>
    <template #footer>
      <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary" :loading="loading"
        icon-right="add" @click="goToNextStep" />
      <q-btn v-else no-caps class="full-width modal-btn" label="Ajouter la personne" color="primary"
        :loading="loading" icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import Modal from '@components/modal/Modal';
import SearchAddress from '@components/form/SearchAddress';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import SelectSector from '@components/form/SelectSector';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'AuxiliaryCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newUser: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    civilityOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: false },
    sendWelcomeMsg: { type: Boolean, default: false },
    emailError: { type: String, default: '' },
  },
  components: {
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-select-sector': SelectSector,
  },
  emits: ['hide', 'update:model-value', 'submit', 'go-to-next-step', 'update:send-welcome-msg', 'update-new-user'],
  data () {
    return { REQUIRED_LABEL };
  },
  computed: {
    mobilePhoneError () {
      if (get(this.validations, 'contact.phone.required.$response') === false) return REQUIRED_LABEL;
      if (get(this.validations, 'contact.phone.frPhoneNumber.$response') === false) {
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
      this.$emit('update:model-value', event);
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
