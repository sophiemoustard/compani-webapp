<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
      <template #title>
        Ajouter un <span class="text-weight-bold">établissement</span>
      </template>
      <ni-input in-modal caption="Nom" :model-value="newEstablishment.name" :error="validations.name.$error"
        :error-message="establishmentNameError(validations)" @blur="validations.name.$touch"
        required-field @update:model-value="update($event, 'name')" />
      <ni-input in-modal caption="SIRET" :model-value="newEstablishment.siret" :error="validations.siret.$error"
        :error-message="establishmentSiretError(validations)" @blur="validations.siret.$touch"
        required-field @update:model-value="update($event, 'siret')" />
      <ni-search-address in-modal :model-value="newEstablishment.address" color="white"
        @blur="validations.address.$touch" :error-message="establishmentAddressError(validations)"
        :error="validations.address.$error" required-field @update:model-value="update($event, 'address')" />
      <ni-input in-modal caption="Téléphone" :model-value="newEstablishment.phone" :error="validations.phone.$error"
        :error-message="establishmentPhoneError(validations)" @blur="validations.phone.$touch"
        required-field @update:model-value="update($event, 'phone')" />
      <ni-select in-modal caption="Service de santé du travail" :model-value="newEstablishment.workHealthService"
        :options="workHealthServices" :error="validations.workHealthService.$error"
        :error-message="establishmentWhsError(validations)" @blur="validations.workHealthService.$touch"
        required-field @update:model-value="update($event, 'workHealthService')" />
      <ni-select in-modal caption="Code URSSAF" :model-value="newEstablishment.urssafCode" :options="urssafCodes"
        :error="validations.urssafCode.$error" @blur="validations.urssafCode.$touch"
        :error-message="establishmentUrssafCodeError(validations)" required-field
        @update:model-value="update($event, 'urssafCode')" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un établissement" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import { establishmentMixin } from '@mixins/establishmentMixin';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import SearchAddress from '@components/form/SearchAddress';

export default {
  name: 'EstablishmentCreationModal',
  mixins: [establishmentMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    newEstablishment: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    workHealthServices: { type: Array, default: () => [] },
    urssafCodes: { type: Array, default: () => [] },
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
