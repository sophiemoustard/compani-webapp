<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
      <template #title>
        Editer le <span class="text-weight-bold">tiers payeur</span>
      </template>
      <ni-input in-modal caption="Nom" @update:model-value="update($event.trim(), 'name')" required-field
        :error="validations.name.$error" @blur="validations.name.$touch" :model-value="editedThirdPartyPayer.name" />
      <ni-search-address in-modal :model-value="editedThirdPartyPayer.address" error-message="Adresse invalide"
        @blur="validations.address.$touch" :error="validations.address.$error"
        @update:model-value="update($event, 'address')" />
      <ni-input in-modal caption="Email" :model-value="editedThirdPartyPayer.email" error-message="Email invalide"
        :error="validations.email.$error" @update:model-value="update($event.trim(), 'email')"
        @blur="validations.email.$touch" />
      <ni-input in-modal caption="Prix unitaire TTC par défaut" suffix="€" type="number"
        :model-value="editedThirdPartyPayer.unitTTCRate" :error="validations.unitTTCRate.$error"
        :error-message="nbrError('unitTTCRate', validations)" @update:model-value="update($event, 'unitTTCRate')" />
      <ni-select in-modal :model-value="editedThirdPartyPayer.billingMode" :options="billingModeOptions"
        caption="Facturation" :filter="false" required-field :error="validations.billingMode.$error"
        @blur="validations.billingMode.$touch" @update:model-value="update($event, 'billingMode')" />
      <ni-input in-modal caption="ID de télétransmission" :model-value="editedThirdPartyPayer.teletransmissionId"
        @update:model-value="update($event, 'teletransmissionId')" />
      <ni-select in-modal caption="Type d'aide" :model-value="editedThirdPartyPayer.teletransmissionType"
        :options="thirdPartyPayerTypeOptions" :clearable="!editedThirdPartyPayer.teletransmissionId"
        @blur="validations.teletransmissionType.$touch" @update:model-value="update($event, 'teletransmissionType')"
        :required-field="!!editedThirdPartyPayer.teletransmissionId" :error="validations.teletransmissionType.$error" />
      <ni-input in-modal caption="Identifiant structure" @update:model-value="update($event, 'companyCode')"
        :model-value="editedThirdPartyPayer.companyCode" :error="validations.companyCode.$error"
        @blur="validations.companyCode.$touch" :required-field="!!editedThirdPartyPayer.teletransmissionId" />
      <div class="row q-mb-md light-checkbox">
        <q-checkbox :model-value="editedThirdPartyPayer.isApa" label="Financement APA" dense
          @update:model-value="update($event, 'isApa')" />
      </div>
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Editer le tiers payeur" icon-right="check" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { configMixin } from 'src/modules/client/mixins/configMixin';
import SearchAddress from '@components/form/SearchAddress';
import Select from '@components/form/Select';

export default {
  name: 'ThirdPartyPayerEditionModal',
  mixins: [configMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    editedThirdPartyPayer: { type: Object, default: () => ({}) },
    billingModeOptions: { type: Array, default: () => [] },
    thirdPartyPayerTypeOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-search-address': SearchAddress,
  },
  emits: ['update:model-value', 'submit', 'update', 'hide'],
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
    update (value, path) {
      this.$emit('update', { path, value });
    },
  },
};
</script>
