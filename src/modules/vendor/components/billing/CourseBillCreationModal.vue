<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Démarrer la <span class="text-weight-bold">facturation</span>
    </template>
    <ni-select in-modal caption="Payeur" :options="payerOptions" :model-value="newBill.funder" required-field
      @blur="validations.funder.$touch" :error="validations.funder.$error"
      @update:model-value="update($event, 'funder')" />
    <ni-input in-modal caption="Prix" :error="validations.price.$error" type="number"
      :model-value="newBill.price" @blur="validations.price.$touch" suffix="€" required-field
      :error-message="priceError" @update:model-value="update($event, 'price')" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Démarrer la facturation" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Button from '@components/Button';
import Select from '@components/form/Select';
import set from 'lodash/set';

export default {
  name: 'CourseBillingItemCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newBill: { type: Object, default: () => ({}) },
    payerOptions: { type: Array, default: () => [] },
    priceError: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-bill'],
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
    update (event, path) {
      this.$emit('update:new-bill', set({ ...this.newBill }, path, event));
    },
  },
};
</script>
