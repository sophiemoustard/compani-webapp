<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Démarrer la <span class="text-weight-bold">facturation</span>
    </template>
    <ni-select in-modal caption="Payeur" :options="payerOptions" :model-value="newBill.funder" required-field
      @update:model-value="update($event, 'funder')" />
    <ni-input in-modal caption="Prix" :error="validations.mainFee.price.$error" type="number"
      :model-value="newBill.mainFee.price" @blur="validations.mainFee.price.$touch" suffix="€" required-field
      :error-message="errorMessages.price" @update:model-value="update($event, 'mainFee.price')" />
    <ni-input in-modal caption="Quantité" :error="validations.mainFee.count.$error" type="number"
      :model-value="newBill.mainFee.count" @blur="validations.mainFee.count.$touch" required-field
      :error-message="errorMessages.count" @update:model-value="update($event, 'mainFee.count')" />
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
  name: 'CourseBillCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newBill: { type: Object, default: () => ({}) },
    payerOptions: { type: Array, default: () => [] },
    errorMessages: { type: Object, default: () => ({}) },
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
