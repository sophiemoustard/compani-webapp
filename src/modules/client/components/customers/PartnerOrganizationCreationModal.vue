<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Créer une nouvelle <span class="text-weight-bold">structure partenaire</span>
    </template>
    <ni-input in-modal caption="Nom" :value="newPartnerOrganization.name" @input="update($event.trim(), 'name')"
      required-field @blur="validations.name.$touch" :error="validations.name.$error" />
    <ni-input in-modal caption="Téléphone" :value="newPartnerOrganization.phone" @input="update($event.trim(), 'phone')"
      @blur="validations.phone.$touch" :error="validations.phone.$error"
      :error-message="phoneNumberError(validations)" />
    <ni-search-address in-modal :value="newPartnerOrganization.address" @input="update($event, 'address')"
      @blur="validations.address.$touch" :error="validations.address.$error"
      :error-message="addressError(validations)" />
    <ni-input in-modal caption="Email" :value="newPartnerOrganization.email" @input="update($event.trim(), 'email')"
      @blur="validations.email.$touch" :error="validations.email.$error" :error-message="emailError(validations)" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer la structure" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import SearchAddress from '@components/form/SearchAddress';
import Input from '@components/form/Input';
import { partnerOrganizationMixin } from '@mixins/partnerOrganizationMixin';

export default {
  name: 'PartnerOrganizationCreationModal',
  mixins: [partnerOrganizationMixin],
  props: {
    value: { type: Boolean, default: false },
    newPartnerOrganization: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-modal': Modal,
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
    update (event, path) {
      this.$emit('update:newPartnerOrganization', set({ ...this.newPartnerOrganization }, path, event));
    },
  },
};
</script>
