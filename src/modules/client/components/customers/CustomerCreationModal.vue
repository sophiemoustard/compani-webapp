<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Créer une nouvelle <span class="text-weight-bold">fiche bénéficiaire</span>
    </template>
    <ni-select in-modal v-model="newCustomer.identity.title" :error="validations.identity.title.$error"
      :options="civilityOptions" caption="Civilité" @blur="validations.identity.title.$touch" required-field />
    <ni-input in-modal v-model.trim="newCustomer.identity.lastname" :error="validations.identity.lastname.$error"
      caption="Nom" @blur="validations.identity.lastname.$touch" required-field />
    <ni-input in-modal v-model.trim="newCustomer.identity.firstname" caption="Prénom" />
    <div class="row margin-input last">
      <ni-search-address v-model="newCustomer.contact.primaryAddress" in-modal required-field
        :error="validations.contact.primaryAddress.$error" :error-message="primaryAddressError"
        @blur="validations.contact.primaryAddress.$touch" />
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer la fiche" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import SearchAddress from '@components/form/SearchAddress';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'CustomerCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newCustomer: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    civilityOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
  },
  computed: {
    primaryAddressError () {
      return !this.validations.contact.primaryAddress.fullAddress.required ? REQUIRED_LABEL : 'Adresse non valide';
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
