<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Confirmation
    </template>
   <ni-date-input caption="Date de facture" :model-value="billToValidate.billedAt" :error="validations.billedAt.$error"
      @blur="validations.billedAt.$touch" in-modal required-field @update:model-value="update($event, 'billedAt')" />
    <template #footer>
      <div class="q-pl-lg">Cette opération est définitive. Confirmez-vous ?</div>
      <div class="row justify-end q-ma-md">
        <ni-button label="NON" :loading="loading" @click="cancel" />
        <ni-button label="OUI" :loading="loading" @click="submit" />
      </div>
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import DateInput from '@components/form/DateInput';
import set from 'lodash/set';

export default {
  name: 'CourseBillValidationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    billToValidate: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-date-input': DateInput,
  },
  emits: ['hide', 'update:model-value', 'submit', 'cancel', 'update:bill-to-validate'],
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
    cancel () {
      this.$emit('cancel');
    },
    update (event, path) {
      this.$emit('update:bill-to-validate', set({ ...this.billToValidate }, path, event));
    },
  },
};
</script>
