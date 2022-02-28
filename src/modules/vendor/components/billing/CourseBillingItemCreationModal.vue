<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Ajouter un <span class="text-weight-bold">article</span>
    </template>
    <ni-input in-modal caption="Nom" :model-value="newItem.name" @update:model-value="update($event.trim(), 'name')"
      :error="validations.name.$error" required-field />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Ajouter" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Button from '@components/Button';
import set from 'lodash/set';

export default {
  name: 'CourseBillingItemCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newItem: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-item'],
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
      this.$emit('update:new-item', set({ ...this.newItem }, path, event));
    },
  },
};
</script>
