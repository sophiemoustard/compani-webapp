<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Éditer une <span class="text-weight-bold">personne</span>
    </template>
    <ni-input in-modal :model-value="editedHelper.local.email" caption="Email" disable />
    <ni-input in-modal :model-value="editedHelper.identity.lastname" :error="validations.identity.lastname.$error"
      caption="Nom" @blur="validations.identity.lastname.$touch" required-field
      @update:model-value="update($event.trim(), 'identity.lastname')" />
    <ni-input in-modal :model-value="editedHelper.identity.firstname" caption="Prénom"
      @update:model-value="update($event.trim(), 'identity.firstname')" />
    <ni-input in-modal :model-value="editedHelper.contact.phone" last :error="validations.contact.phone.$error"
      caption="Téléphone" @blur="validations.contact.phone.$touch" :error-message="phoneNbrError"
      @update:model-value="update($event.trim(), 'contact.phone')" />
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
    modelValue: { type: Boolean, default: false },
    editedHelper: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-helper'],
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
      this.$emit('update:model-value', event);
    },
    update (event, path) {
      this.$emit('update:edited-helper', set({ ...this.editedHelper }, path, event));
    },
  },
};
</script>
