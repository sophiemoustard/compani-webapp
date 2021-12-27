<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input :disable="!firstStep" in-modal :model-value="newHelper.local.email" caption="Email" required-field
      :error="validations.local.email.$error" @blur="validations.local.email.$touch" :error-message="emailError"
      :last="firstStep" @update:model-value="update($event.trim(), 'local.email')" />
    <template v-if="!firstStep">
      <ni-input in-modal :model-value="newHelper.identity.firstname" caption="Prénom"
        @update:model-value="update($event.trim(), 'identity.firstname')" />
      <ni-input in-modal :model-value="newHelper.identity.lastname" :error="validations.identity.lastname.$error"
        caption="Nom" @blur="validations.identity.lastname.$touch" required-field
        @update:model-value="update($event.trim(), 'identity.lastname')" />
      <ni-input in-modal :model-value="newHelper.contact.phone" last :error="validations.contact.phone.$error"
        caption="Téléphone" @blur="validations.contact.phone.$touch" :error-message="phoneNbrError"
        @update:model-value="update($event.trim(), 'contact.phone')" />
    </template>
    <template #footer>
      <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary" @click="nextStep"
        :loading="loading" icon-right="add" />
      <q-btn v-else no-caps class="full-width modal-btn" label="Ajouter la personne" icon-right="add"
        color="primary" :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import get from 'lodash/get';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'HelperCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newHelper: { type: Object, default: () => ({}) },
    company: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'submit', 'next-step', 'update:new-helper'],
  computed: {
    emailError () {
      if (!this.validations.local.email.required) {
        return REQUIRED_LABEL;
      } if (!this.validations.local.email.email) {
        return 'Email non valide';
      }
      return '';
    },
    phoneNbrError () {
      if (!get(this.validations, 'contact.phone.frPhoneNumber', null)) {
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
    nextStep () {
      this.$emit('next-step');
    },
    update (event, path) {
      this.$emit('update:new-helper', set({ ...this.newHelper }, path, event));
    },
  },
};
</script>
