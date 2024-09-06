<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Ajouter un <span class="text-weight-bold">financeur</span>
    </template>
    <ni-input in-modal caption="Nom" :model-value="newOrganisation.name" :error="validations.name.$error"
      @update:model-value="update($event.trim(), 'name')" required-field />
    <ni-input in-modal last caption="Adresse" :model-value="newOrganisation.address" :error="validations.address.$error"
      @update:model-value="update($event, 'address')" @blur="validations.address.$touch"
      :error-message="addressErrorMessage" required-field />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Ajouter" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs, computed } from 'vue';
import set from 'lodash/set';
import get from 'lodash/get';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Button from '@components/Button';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'CourseFundingOrganisationCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newOrganisation: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-organisation'],
  setup (props, { emit }) {
    const { newOrganisation, validations } = toRefs(props);

    const addressErrorMessage = computed(() => (
      get(validations.value, 'address.fullAddress.frAddress.$response') === false
        ? 'Adresse non valide'
        : REQUIRED_LABEL));

    const hide = () => emit('hide');

    const input = event => emit('update:model-value', event);

    const submit = () => emit('submit');

    const update = (event, path) => emit('update:new-organisation', set({ ...newOrganisation.value }, path, event));

    return {
      // Computed
      addressErrorMessage,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
