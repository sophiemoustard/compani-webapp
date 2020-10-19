<template>
  <ni-modal :value="value" @hide="hide" @input="input">
      <template slot="title">
        Éditer l'<span class="text-weight-bold">établissement</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="editedEstablishment.name" :error="validations.name.$error"
        :error-message="establishmentNameError(validations)" @blur="validations.name.$touch"
        required-field />
      <ni-input in-modal caption="SIRET" v-model="editedEstablishment.siret"
        :error="validations.siret.$error" :error-message="establishmentSiretError(validations)"
        @blur="validations.siret.$touch" required-field />
      <ni-search-address in-modal v-model="editedEstablishment.address" color="white"
        @blur="validations.address.$touch" :error-message="establishmentAddressError(validations)"
        :error="validations.address.$error" required-field />
      <ni-input in-modal caption="Téléphone" v-model="editedEstablishment.phone"
        :error="validations.phone.$error" :error-message="establishmentPhoneError(validations)"
        @blur="validations.phone.$touch" required-field />
      <ni-select in-modal caption="Service de santé du travail" v-model="editedEstablishment.workHealthService"
        :options="workHealthServices" :error="validations.workHealthService.$error"
        :error-message="establishmentWhsError(validations)"
        @blur="validations.workHealthService.$touch" required-field />
      <ni-select in-modal caption="Code URSSAF" v-model="editedEstablishment.urssafCode" :options="urssafCodes"
        :error="validations.urssafCode.$error"
        :error-message="establishmentUrssafCodeError(validations)"
        @blur="validations.urssafCode.$touch" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer l'établissement" icon-right="add" color="primary"
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
  name: 'EstablishmentEditionModal',
  mixins: [establishmentMixin],
  props: {
    value: { type: Boolean, default: false },
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
