<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
      Ajouter un <span class="text-weight-bold">document</span>
    </template>
    <ni-select in-modal caption="Type" required-field :model-value="newPayDocument.nature" :options="natureOptions"
      @blur="validations.nature.$touch" @update:model-value="update('nature', $event)"
      :error="validations.nature.$error" />
    <ni-date-input in-modal caption="Date" required-field :model-value="newPayDocument.date"
      @update:model-value="update('date', $event)" />
    <ni-input in-modal caption="Document" type="file" :model-value="newPayDocument.file" required-field last
      :error-message="fileErrorMessage" @update:model-value="updateDocument" :error="validations.file.$error" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter le document" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Select from '@components/form/Select';
import DateInput from '@components/form/DateInput';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import { REQUIRED_LABEL, PAY_DOCUMENT_NATURES } from '@data/constants';

export default {
  name: 'DocumentUpload',
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-date-input': DateInput,
    'ni-input': Input,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    newPayDocument: { type: Object, default: () => ({}) },
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-pay-document'],
  data () {
    return {
      natureOptions: PAY_DOCUMENT_NATURES,
    };
  },
  computed: {
    fileErrorMessage () {
      if (!this.validations.file.maxSize) return 'Fichier trop volumineux (> 5 Mo)';
      return REQUIRED_LABEL;
    },
  },
  methods: {
    updateDocument (event) {
      this.validations.file.$touch();
      this.update('file', event);
    },
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    onBlur (field) {
      if (this.validations[field]) this.validations[field].$touch();
    },
    async update (path, value) {
      this.$emit('update:new-pay-document', set({ ...this.newPayDocument }, path, value));
    },
  },
};
</script>
