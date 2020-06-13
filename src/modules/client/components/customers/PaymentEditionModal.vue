<template>
  <ni-modal :value="value" @input="$emit('input', $event)" @hide="resetForm">
    <template slot="title">
      Editer le <span class="text-weight-bold">{{ editionModalNature }}</span>
    </template>
    <ni-input in-modal caption="Bénéficiaire" :value="customerFullname" required-field read-only />
    <ni-input in-modal caption="Client" v-model="selectedClientName" required-field read-only />
    <ni-input in-modal :caption="`Montant du ${editionModalNature}`" suffix="€" type="number"
      v-model="editedPayment.netInclTaxes" required-field :error="validations.netInclTaxes.$error"
      @blur="validations.netInclTaxes.$touch" :error-label="netInclTaxesError" />
    <ni-select in-modal :caption="`Type du ${editionModalNature}`" v-model="editedPayment.type"
      :options="paymentOptions" required-field @blur="validations.type.$touch" :error="validations.type.$error" />
    <ni-date-input :caption="`Date du ${editionModalNature}`" v-model="editedPayment.date"
      :error="validations.date.$error" @blur="validations.date.$touch" in-modal type="date" required-field />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" :label="editionButtonLabel" icon-right="add" color="primary"
        :loading="loading" @click="updatePayment" />
    </template>
  </ni-modal>
</template>

<script>
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import DateInput from '@components/form/DateInput';
import { formatIdentity } from '@helpers/utils.js';
import { REQUIRED_LABEL, PAYMENT_OPTIONS, PAYMENT_NATURE_OPTIONS } from '@data/constants.js';

export default {
  name: 'PaymentEditionModal',
  components: {
    'ni-select': Select,
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-modal': Modal,
  },
  props: {
    editedPayment: { type: Object, default: () => ({}) },
    value: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    selectedCustomer: { type: Object, default: () => ({}) },
    selectedTpp: { type: Object, default: () => ({}) },
  },
  data () {
    return {
      paymentOptions: PAYMENT_OPTIONS,
      paymentNatureOptions: PAYMENT_NATURE_OPTIONS,
    };
  },
  computed: {
    netInclTaxesError () {
      if (!this.validations.netInclTaxes.required) return REQUIRED_LABEL;
      return 'Montant TTC non valide';
    },
    editionModalNature () {
      if (!this.editedPayment.nature) return '';
      return this.paymentNatureOptions.find(option => option.value === this.editedPayment.nature).label.toLowerCase();
    },
    editionButtonLabel () {
      return `Editer le ${this.editionModalNature.toLowerCase()}`;
    },
    customerFullname () {
      return formatIdentity(this.selectedCustomer.identity, 'FL');
    },
    selectedClientName () {
      return this.editedPayment.thirdPartyPayer ? this.selectedTpp.name : this.customerFullname;
    },
  },
  methods: {
    resetForm (partialReset, type) {
      this.$emit('resetForm', { partialReset, type });
    },
    updatePayment (value) {
      this.$emit('updatePayment', value);
    },
  },
}
</script>
