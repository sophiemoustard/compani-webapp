<template>
  <ni-modal :value="value" @hide="hide" @input="$emit('input', $event)">
    <template slot="title">
      Éditer l'<span class="text-weight-bold">aidant</span>
    </template>
    <ni-input in-modal v-model="editedHelper.local.email" caption="Email" disable />
    <ni-input in-modal v-model="editedHelper.identity.lastname" :error="validations.identity.lastname.$error"
      caption="Nom" @blur="validations.identity.lastname.$touch" required-field />
    <ni-input in-modal v-model="editedHelper.identity.firstname" caption="Prénom" />
    <ni-input in-modal v-model="editedHelper.contact.phone" last :error="validations.contact.phone.$error"
      caption="Téléphone" @blur="validations.contact.phone.$touch" :error-message="phoneNbrError" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Éditer l'aidant" icon-right="add" color="primary"
        :loading="loading" @click="editHelper" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'EditHelperModal',
  props: {
    value: { type: Boolean, default: false },
    editedHelper: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  computed: {
    phoneNbrError () {
      if (!get(this.validations, 'contact.phone.frPhoneNumber', null)) {
        return 'Numéro de téléphone non valide';
      }

      return '';
    },
  },
  methods: {
    editHelper () {
      this.$emit('editHelper');
    },
    hide () {
      this.$emit('hide');
    },
  },
}
</script>
