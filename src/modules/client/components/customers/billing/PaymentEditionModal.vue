<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template #title>
      Editer le <span class="text-weight-bold">{{ editionModalNature }}</span>
    </template>
    <ni-input in-modal caption="Bénéficiaire" :value="customerFullname" required-field read-only />
    <ni-input in-modal caption="Client" v-model="selectedClientName" required-field read-only />
    <ni-input in-modal :caption="`Montant du ${editionModalNature}`" suffix="€" @blur="validations.netInclTaxes.$touch"
      :value="editedPayment.netInclTaxes" @input="update($event, 'netInclTaxes')" type="number" required-field
      :error="validations.netInclTaxes.$error" :error-message="netInclTaxesError" />
    <ni-select in-modal :caption="`Type du ${editionModalNature}`" :value="editedPayment.type"
      @input="update($event, 'type')" :options="paymentOptions" required-field
      @blur="validations.type.$touch" :error="validations.type.$error" />
    <ni-date-input :caption="`Date du ${editionModalNature}`" :value="editedPayment.date" in-modal required-field
      @input="update($event, 'date')" :error="validations.date.$error" @blur="validations.date.$touch" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" :label="editionButtonLabel" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import DateInput from '@components/form/DateInput';
import { formatIdentity } from '@helpers/utils';
import { REQUIRED_LABEL, PAYMENT_OPTIONS, PAYMENT_NATURE_OPTIONS } from '@data/constants';

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
    hide (partialReset, type) {
      this.$emit('hide', { partialReset, type });
    },
    input (event) {
      this.$emit('input', event);
    },
    submit (value) {
      this.$emit('submit', value);
    },
    update (event, prop) {
      this.$emit('update:editedPayment', { ...this.editedPayment, [prop]: event });
    },
  },
};
</script>
