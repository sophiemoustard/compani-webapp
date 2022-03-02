<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Ajouter un article <span class="text-weight-bold">à facturer</span>
    </template>
    <ni-select in-modal caption="Article" :options="billingItemOptions" :model-value="newBillingItem.billingItem"
      required-field
      @blur="validations.billingItem.$touch" :error="validations.billingItem.$error"
      @update:model-value="update($event, 'billingItem')" />
    <ni-input in-modal caption="Prix unitaire" :error="validations.price.$error" type="number"
      :model-value="newBillingItem.price" @blur="validations.price.$touch" suffix="€" required-field
      :error-message="errorMessages.price" @update:model-value="update($event, 'price')" />
    <ni-input in-modal caption="Quantité" :error="validations.count.$error" type="number"
      :model-value="newBillingItem.count" @blur="validations.count.$touch" required-field
      :error-message="errorMessages.count" @update:model-value="update($event, 'count')" />
    <ni-input in-modal caption="Description" :error="validations.description.$error" type="textarea"
      :model-value="newBillingItem.description" @blur="validations.description.$touch"
      @update:model-value="update($event, 'description')" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Ajouter l'article" icon-right="add" color="white"
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
    newBillingItem: { type: Object, default: () => ({}) },
    billingItemOptions: { type: Array, default: () => [] },
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
  emits: ['hide', 'update:model-value', 'submit', 'update:new-billing-item'],
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
      this.$emit('update:new-billing-item', set({ ...this.newBillingItem }, path, event));
    },
  },
};
</script>
