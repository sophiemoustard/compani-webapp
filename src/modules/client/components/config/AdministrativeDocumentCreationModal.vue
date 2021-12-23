<template>
    <ni-modal :value="value" @hide="hide" @input="input">
      <template #title>
        Ajouter un <span class="text-weight-bold">document administratif</span>
      </template>
      <ni-input in-modal caption="Nom" :value="newAdministrativeDocument.name" required-field
        :error="validations.name.$error" @blur="validations.name.$touch" @input="update($event, 'name')" />
      <ni-input caption="Document" type="file" :value="newAdministrativeDocument.file" required-field last
        :error="validations.file.$error" @blur="validations.file.$touch" in-modal @input="update($event, 'file')" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un document" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'AdministrativeDocumentCreationModal',
  props: {
    value: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    newAdministrativeDocument: { type: Object, required: true },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
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
    update (event, prop) {
      this.$emit('update:newAdministrativeDocument', { ...this.newAdministrativeDocument, [prop]: event });
    },
  },
};
</script>
