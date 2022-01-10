<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
      Ajouter un <span class="text-weight-bold">{{ creationModalNature }}</span>
    </template>
    <ni-btn-toggle :model-value="newPayment.nature" :options="paymentNatureOptions"
      @update:model-value="update($event, 'nature')" />
    <ni-input in-modal caption="Bénéficiaire" :model-value="customerFullname" required-field read-only />
    <ni-input in-modal caption="Client" v-model="selectedClientName" required-field read-only />
    <ni-input in-modal :caption="`Montant du ${creationModalNature}`" suffix="€" type="number" required-field
      :model-value="newPayment.netInclTaxes" @update:model-value="update($event, 'netInclTaxes')"
      :error="validations.netInclTaxes.$error" @blur="validations.netInclTaxes.$touch"
      :error-message="netInclTaxesError" />
    <ni-select in-modal :caption="`Type du ${creationModalNature}`" :model-value="newPayment.type" required-field
      @update:model-value="update($event, 'type')" :options="paymentOptions" @blur="validations.type.$touch"
      :error="validations.type.$error" />
    <ni-date-input :model-value="newPayment.date" @update:model-value="update($event, 'date')" in-modal required-field
      :error="validations.date.$error" @blur="validations.date.$touch" :caption="`Date du ${creationModalNature}`" />
    <template #footer>
      <q-btn no-caps class="full-width" :label="creationButtonLabel" icon-right="add" color="primary" :loading="loading"
        @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import DateInput from '@components/form/DateInput';
import Modal from '@components/modal/Modal';
import ButtonToggle from '@components/ButtonToggle';
import { formatIdentity } from '@helpers/utils';
import { REQUIRED_LABEL, PAYMENT_OPTIONS, PAYMENT_NATURE_OPTIONS } from '@data/constants';

export default {
  name: 'PaymentCreationModal',
  components: {
    'ni-select': Select,
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-modal': Modal,
    'ni-btn-toggle': ButtonToggle,
  },
  props: {
    newPayment: { type: Object, default: () => ({}) },
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    selectedCustomer: { type: Object, default: () => ({}) },
    selectedTpp: { type: Object, default: () => ({}) },
  },
  emits: ['update:model-value', 'hide', 'submit', 'update:new-payment'],
  data () {
    return {
      paymentOptions: PAYMENT_OPTIONS,
      paymentNatureOptions: PAYMENT_NATURE_OPTIONS,
    };
  },
  computed: {
    netInclTaxesError () {
      if (get(this.validations, 'netInclTaxes.required.$response') === false) return REQUIRED_LABEL;
      return 'Montant TTC non valide';
    },
    creationModalNature () {
      if (!this.newPayment.nature) return '';
      return this.paymentNatureOptions.find(option => option.value === this.newPayment.nature).label.toLowerCase();
    },
    creationButtonLabel () {
      return `Créer le ${this.creationModalNature.toLowerCase()}`;
    },
    customerFullname () {
      return formatIdentity(this.selectedCustomer.identity, 'FL');
    },
    selectedClientName () {
      return this.newPayment.thirdPartyPayer ? this.selectedTpp.name : this.customerFullname;
    },
  },
  methods: {
    hide (partialReset, type) {
      this.$emit('hide', { partialReset, type });
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit (value) {
      this.$emit('submit', value);
    },
    update (event, prop) {
      this.$emit('update:new-payment', { ...this.newPayment, [prop]: event });
    },
  },
};
</script>
