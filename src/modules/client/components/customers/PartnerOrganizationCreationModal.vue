<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer une nouvelle <span class="text-weight-bold">structure partenaire</span>
    </template>
    <ni-input in-modal caption="Nom" :model-value="newPartnerOrganization.name" @blur="validations.name.$touch"
      @update:model-value="update($event.trim(), 'name')" required-field :error="validations.name.$error" />
    <ni-input in-modal caption="Téléphone" :model-value="newPartnerOrganization.phone" @blur="validations.phone.$touch"
      @update:model-value="update($event.trim(), 'phone')" :error="validations.phone.$error"
      :error-message="phoneNumberError(validations)" />
    <ni-search-address :model-value="newPartnerOrganization.address" @update:model-value="update($event, 'address')"
      @blur="validations.address.$touch" :error="validations.address.$error" in-modal
      :error-message="addressError(validations)" />
    <ni-input in-modal caption="Email" :model-value="newPartnerOrganization.email" @blur="validations.email.$touch"
      @update:model-value="update($event.trim(), 'email')" :error="validations.email.$error"
      :error-message="emailError(validations)" />
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
import { partnerOrganizationMixin } from 'src/modules/client/mixins/partnerOrganizationMixin';

export default {
  name: 'PartnerOrganizationCreationModal',
  mixins: [partnerOrganizationMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    newPartnerOrganization: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-modal': Modal,
  },
  emits: ['update:new-partner-organization', 'submit', 'update:model-value', 'hide'],
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
      this.$emit('update:new-partner-organization', set({ ...this.newPartnerOrganization }, path, event));
    },
  },
};
</script>
