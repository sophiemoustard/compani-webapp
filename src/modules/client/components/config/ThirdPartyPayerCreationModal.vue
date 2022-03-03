<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
      <template #title>
        Ajouter un <span class="text-weight-bold">tiers payeur</span>
      </template>
      <ni-input in-modal caption="Nom" :model-value="newThirdPartyPayer.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field @update:model-value="update($event.trim(), 'name')" />
      <ni-search-address :model-value="newThirdPartyPayer.address" error-message="Adresse invalide" in-modal
        @blur="validations.address.$touch" @update:model-value="update($event, 'address')"
        :error="validations.address.$error" />
      <ni-input in-modal caption="Email" :model-value="newThirdPartyPayer.email" error-message="Email non valide"
        :error="validations.email.$error" @update:model-value="update($event.trim(), 'email')"
        @blur="validations.email.$touch" />
      <ni-input in-modal caption="Prix unitaire TTC par défaut" suffix="€" type="number"
        :model-value="newThirdPartyPayer.unitTTCRate" :error="validations.unitTTCRate.$error"
        :error-message="nbrError('unitTTCRate', validations)" @update:model-value="update($event, 'unitTTCRate')" />
      <ni-select :model-value="newThirdPartyPayer.billingMode" :options="billingModeOptions" caption="Facturation"
        :filter="false" required-field :error="validations.billingMode.$error" in-modal
        @blur="validations.billingMode.$touch" @update:model-value="update($event, 'billingMode')" />
      <ni-input in-modal caption="ID de télétransmission" :model-value="newThirdPartyPayer.teletransmissionId"
        @update:model-value="update($event, 'teletransmissionId')" />
      <div class="row q-mb-md light-checkbox">
        <q-checkbox :model-value="newThirdPartyPayer.isApa" @update:model-value="update($event, 'isApa')" dense
          label="Financement APA" />
      </div>
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Ajouter le tiers payeur" icon-right="add" color="primary"
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
  name: 'ThirdPartyPayerCreationModal',
  mixins: [configMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    newThirdPartyPayer: { type: Object, default: () => ({}) },
    billingModeOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-search-address': SearchAddress,
  },
  emits: ['update:model-value', 'hide', 'submit', 'update'],
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
