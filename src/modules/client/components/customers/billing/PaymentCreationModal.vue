<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      Ajouter un <span class="text-weight-bold">{{ creationModalNature }}</span>
    </template>
    <div class="modal-subtitle">
      <q-btn-toggle no-wrap :value="newPayment.nature" :options="paymentNatureOptions" toggle-color="primary"
        @input="update($event, 'nature')" />
    </div>
    <ni-input in-modal caption="Bénéficiaire" :value="customerFullname" required-field read-only />
    <ni-input in-modal caption="Client" v-model="selectedClientName" required-field read-only />
    <ni-input in-modal :caption="`Montant du ${creationModalNature}`" suffix="€" type="number" required-field
      :value="newPayment.netInclTaxes" @input="update($event, 'netInclTaxes')" :error-message="netInclTaxesError"
      :error="validations.netInclTaxes.$error" @blur="validations.netInclTaxes.$touch" />
    <ni-select in-modal :caption="`Type du ${creationModalNature}`" :value="newPayment.type"
      @input="update($event, 'type')" :options="paymentOptions" required-field @blur="validations.type.$touch"
      :error="validations.type.$error" />
    <ni-date-input :value="newPayment.date" @input="update($event, 'date')" :caption="`Date du ${creationModalNature}`"
      :error="validations.date.$error" @blur="validations.date.$touch" in-modal required-field />
    <template slot="footer">
      <q-btn no-caps class="full-width" :label="creationButtonLabel" icon-right="add" color="primary" :loading="loading"
        @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import DateInput from '@components/form/DateInput';
import Modal from '@components/modal/Modal';
import { formatIdentity } from '@helpers/utils';
import { REQUIRED_LABEL, PAYMENT_OPTIONS, PAYMENT_NATURE_OPTIONS } from '@data/constants';

export default {
  name: 'PaymentCreationModal',
  components: {
    'ni-select': Select,
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-modal': Modal,
  },
  props: {
    newPayment: { type: Object, default: () => ({}) },
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
      this.$emit('input', event);
    },
    submit (value) {
      this.$emit('submit', value);
    },
    update (event, prop) {
      this.$emit('update:newPayment', { ...this.newPayment, [prop]: event });
    },
  },
};
</script>

<style lang="stylus" scoped>
  .modal-subtitle
    display: flex
    justify-content: space-between
    margin-bottom: 16px
    .q-btn-toggle
      margin-bottom: 0
      cursor: default
      width: 100%
    & /deep/ .q-btn-toggle
      border: none
      box-shadow: none
      & .q-btn-item
        width: 50%
        border-radius: 20px
        margin: 5px
        background-color: $copper-grey-300
</style>
