<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Éditer l'<span class="text-weight-bold">établissement</span>
    </template>
    <ni-input in-modal caption="Nom" :model-value="editedEstablishment.name" :error="validations.name.$error"
      :error-message="establishmentNameError(validations)" @blur="validations.name.$touch"
      required-field @update:model-value="update($event, 'name')" />
    <ni-input in-modal caption="SIRET" :model-value="editedEstablishment.siret"
      :error="validations.siret.$error" :error-message="establishmentSiretError(validations)"
      @blur="validations.siret.$touch" required-field @update:model-value="update($event, 'siret')" />
    <ni-search-address in-modal :model-value="editedEstablishment.address" color="white"
      @blur="validations.address.$touch" :error-message="establishmentAddressError(validations)"
      :error="validations.address.$error" required-field @update:model-value="update($event, 'address')" />
    <ni-input in-modal :model-value="editedEstablishment.phone" @update:model-value="update($event, 'phone')"
      :error="validations.phone.$error" :error-message="establishmentPhoneError(validations)" caption="Téléphone"
      @blur="validations.phone.$touch" required-field />
    <ni-select in-modal caption="Service de santé du travail" :model-value="editedEstablishment.workHealthService"
      :options="workHealthServices" :error="validations.workHealthService.$error"
      :error-message="establishmentWhsError(validations)" @update:model-value="update($event, 'workHealthService')"
      @blur="validations.workHealthService.$touch" required-field />
    <ni-select in-modal caption="Code URSSAF" :model-value="editedEstablishment.urssafCode" :options="urssafCodes"
      :error="validations.urssafCode.$error" @update:model-value="update($event, 'urssafCode')" required-field
      :error-message="establishmentUrssafCodeError(validations)" @blur="validations.urssafCode.$touch" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Editer l'établissement" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import SearchAddress from '@components/form/SearchAddress';
import { establishmentMixin } from 'src/modules/client/mixins/establishmentMixin';

export default {
  name: 'EstablishmentEditionModal',
  mixins: [establishmentMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    editedEstablishment: { type: Object, default: () => ({}) },
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
  emits: ['hide', 'update:model-value', 'submit', 'update'],
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
