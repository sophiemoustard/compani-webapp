<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      <span class="text-weight-bold">{{ editedBill.title }}</span>
    </template>
    <ni-input in-modal caption="Prix unitaire" :error="validations.mainFee.price.$error" type="number"
      :model-value="editedBill.mainFee.price" @blur="validations.mainFee.price.$touch" suffix="€" required-field
      :error-message="errorMessages.price" @update:model-value="update($event, 'mainFee.price')" />
    <ni-input in-modal caption="Quantité" :error="validations.mainFee.count.$error" type="number"
      :model-value="editedBill.mainFee.count" @blur="validations.mainFee.count.$touch" required-field
      :error-message="errorMessages.count" @update:model-value="update($event, 'mainFee.count')" />
    <ni-input in-modal caption="Description" type="textarea" :model-value="editedBill.mainFee.description"
      @update:model-value="update($event, 'mainFee.description')" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Enregistrer et fermer" icon-right="save" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import Input from '@components/form/Input';
import set from 'lodash/set';

export default {
  name: 'CourseFeeEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    editedBill: { type: Object, default: () => ({}) },
    errorMessages: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-input': Input,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-bill'],
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
      this.$emit('update:edited-bill', set({ ...this.editedBill }, path, event));
    },
  },
};
</script>
