<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Ajouter un <span class="text-weight-bold">aidant</span>
    </template>
    <ni-input :disable="!firstStep" in-modal v-model.trim="newHelper.local.email" caption="Email" required-field
      :error="validations.local.email.$error" @blur="validations.local.email.$touch" :error-message="emailError"
      :last="firstStep" />
    <template v-if="!firstStep">
      <ni-input in-modal v-model="newHelper.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model="newHelper.identity.lastname" :error="validations.identity.lastname.$error"
        caption="Nom" @blur="validations.identity.lastname.$touch" required-field />
      <ni-input in-modal v-model.trim="newHelper.contact.phone" last :error="validations.contact.phone.$error"
        caption="Téléphone" @blur="validations.contact.phone.$touch" :error-message="phoneNbrError" />
    </template>
    <template slot="footer">
      <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary" @click="nextStep"
        :loading="loading" icon-right="add" />
      <q-btn v-else no-caps class="full-width modal-btn" label="Ajouter un aidant" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'HelperCreationModal',
  props: {
    value: { type: Boolean, default: false },
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
    input () {
      this.$emit('input', this.$event);
    },
    submit () {
      this.$emit('submit');
    },
    nextStep () {
      this.$emit('next-step');
    },
  },
};
</script>
