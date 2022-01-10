<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer une nouvelle <span class="text-weight-bold">fiche bénéficiaire</span>
    </template>
    <ni-select in-modal :model-value="newCustomer.identity.title" :error="validations.identity.title.$error"
      :options="civilityOptions" caption="Civilité" @blur="validations.identity.title.$touch" required-field
      @update:model-value="update($event, 'identity.title')" />
    <ni-input in-modal :model-value="newCustomer.identity.lastname" :error="validations.identity.lastname.$error"
      caption="Nom" @blur="validations.identity.lastname.$touch" required-field
      @update:model-value="update($event.trim(), 'identity.lastname')" />
    <ni-input in-modal :model-value="newCustomer.identity.firstname" caption="Prénom"
      @update:model-value="update($event.trim(), 'identity.firstname')" />
    <div class="row margin-input last">
      <ni-search-address :model-value="newCustomer.contact.primaryAddress" in-modal required-field
        :error="validations.contact.primaryAddress.$error" @blur="validations.contact.primaryAddress.$touch"
        :error-message="primaryAddressError" @update:model-value="update($event, 'contact.primaryAddress')" />
    </div>
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer la fiche" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import SearchAddress from '@components/form/SearchAddress';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'CustomerCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newCustomer: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    civilityOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  emits: ['hide', 'submit', 'update:new-customer', 'update:model-value'],
  components: {
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
  },
  computed: {
    primaryAddressError () {
      return get(this.validations, 'contact.primaryAddress.fullAddress.required.$reponse') === false
        ? REQUIRED_LABEL
        : 'Adresse non valide';
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
      this.$emit('update:new-customer', set({ ...this.newCustomer }, path, event));
    },
  },
};
</script>
