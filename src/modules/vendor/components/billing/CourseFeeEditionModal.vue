<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      <span class="text-weight-bold">{{ title }}</span>
    </template>
    <ni-input in-modal caption="Prix unitaire" :error="validations.price.$error" type="number" :disable="isBilled"
      :model-value="courseFee.price" @blur="validations.price.$touch" suffix="€" required-field
      :error-message="errorMessages.price" @update:model-value="update($event, 'price')" />
    <ni-input in-modal caption="Quantité" :error="validations.count.$error" type="number" :disable="isBilled"
      :model-value="courseFee.count" @blur="validations.count.$touch" required-field
      :error-message="errorMessages.count" @update:model-value="update($event, 'count')" />
    <ni-input in-modal caption="Description" type="textarea" :model-value="courseFee.description"
      @update:model-value="update($event, 'description')" />
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
    courseFee: { type: Object, default: () => ({}) },
    errorMessages: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    title: { type: String, default: '' },
    isBilled: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-input': Input,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:course-fee'],
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
      this.$emit('update:course-fee', set({ ...this.courseFee }, path, event));
    },
  },
};
</script>
