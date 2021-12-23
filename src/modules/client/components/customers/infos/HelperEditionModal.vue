<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Éditer une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal :value="editedHelper.local.email" caption="Email" disable />
    <ni-input in-modal :value="editedHelper.identity.lastname" :error="validations.identity.lastname.$error"
      caption="Nom" @blur="validations.identity.lastname.$touch" required-field
      @input="update($event.trim(), 'identity.lastname')" />
    <ni-input in-modal :value="editedHelper.identity.firstname" caption="Prénom"
      @input="update($event.trim(), 'identity.firstname')" />
    <ni-input in-modal :value="editedHelper.contact.phone" last :error="validations.contact.phone.$error"
      caption="Téléphone" @blur="validations.contact.phone.$touch" :error-message="phoneNbrError"
      @input="update($event.trim(), 'contact.phone')" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Éditer la personne" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import get from 'lodash/get';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'HelperEditionModal',
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
    submit () {
      this.$emit('submit');
    },
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    update (event, path) {
      this.$emit('update:editedHelper', set({ ...this.editedHelper }, path, event));
    },
  },
};
</script>
