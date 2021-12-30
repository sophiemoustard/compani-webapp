<template>
    <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
      <template #title>
        Ajouter un <span class="text-weight-bold">document administratif</span>
      </template>
      <ni-input in-modal caption="Nom" :model-value="newAdministrativeDocument.name" required-field
        :error="validations.name.$error" @blur="validations.name.$touch" @update:model-value="update($event, 'name')" />
      <ni-input caption="Document" type="file" :model-value="newAdministrativeDocument.file" required-field last
        :error="validations.file.$error" @blur="validations.file.$touch" @update:model-value="update($event, 'file')"
        in-modal />
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
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    newAdministrativeDocument: { type: Object, required: true },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
  },
  emits: ['update:model-value', 'hide', 'submit', 'update:new-administrative-document'],
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
    update (event, prop) {
      this.$emit('update:new-administrative-document', { ...this.newAdministrativeDocument, [prop]: event });
    },
  },
};
</script>
