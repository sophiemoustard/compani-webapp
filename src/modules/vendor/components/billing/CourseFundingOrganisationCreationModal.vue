<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Ajouter un <span class="text-weight-bold">financeur</span>
    </template>
    <ni-input in-modal caption="Nom" :model-value="newOrganisation.name" :error="validations.name.$error"
      @update:model-value="update($event.trim(), 'name')" required-field />
    <ni-search-address in-modal last :model-value="newOrganisation.address" :error="validations.address.$error"
      @update:model-value="update($event, 'address')" @blur="validations.address.$touch"
      :error-message="addressErrorMessage" required-field />
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
import SearchAddress from '@components/form/SearchAddress';
import set from 'lodash/set';
import get from 'lodash/get';
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
    'ni-search-address': SearchAddress,
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-organisation'],
  computed: {
    addressErrorMessage () {
      return get(this.validations, 'address.fullAddress.frAddress.$response') === false
        ? 'Adresse non valide'
        : REQUIRED_LABEL;
    },
  },
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
      this.$emit('update:new-organisation', set({ ...this.newOrganisation }, path, event));
    },
  },
};
</script>
