<template>
  <ni-modal :value="value" @hide="hide" @input="$emit('input', $event)">
    <template slot="title">
      Ajouter un <span class="text-weight-bold">aidant</span>
    </template>
    <ni-input in-modal v-model="newHelper.identity.lastname" :error="validations.identity.lastname.$error"
      caption="Nom" @blur="validations.identity.lastname.$touch" required-field />
    <ni-input in-modal v-model="newHelper.identity.firstname" caption="Prénom" />
    <ni-input in-modal v-model="newHelper.local.email" :error="validations.local.email.$error" caption="Email"
      @blur="validations.local.email.$touch" :error-label="emailError" required-field />
    <ni-input in-modal v-model.trim="newHelper.contact.phone" last :error="validations.contact.phone.$error"
      caption="Téléphone" @blur="validations.contact.phone.$touch" :error-label="phoneNbrError" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Ajouter un aidant" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { REQUIRED_LABEL } from '@data/constants.js';

export default {
  name: 'AddHelperModal',
  props: {
    value: { type: Boolean, default: false },
    newHelper: { type: Object, default: () => ({}) },
    company: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  computed: {
    emailError () {
      if (!this.validations.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.validations.local.email.email) {
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
    submit () {
      this.$emit('submit');
    },
  },
}
</script>
