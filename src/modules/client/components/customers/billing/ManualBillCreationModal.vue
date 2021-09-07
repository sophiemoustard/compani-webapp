<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      Créer une <span class="text-weight-bold">facture manuelle</span>
    </template>
    <ni-date-input caption="Date" :value="newManualBill.date" in-modal required-field
      @input="update($event, 'date')" :error="validations.date.$error" @blur="validations.date.$touch" />
    <ni-select in-modal caption="Bénéficiaire" :value="newManualBill.customer"
      @input="update($event, 'customer')" :options="customersOptions" required-field
      @blur="validations.customer.$touch" :error="validations.customer.$error" />
    <ni-select in-modal caption="Article" :value="newManualBill.billingItem" @blur="validations.billingItem.$touch"
      @input="updateBillingItem($event)" :options="billingItemsOptions" :error="validations.billingItem.$error"
      required-field />
    <div class="flex-row q-mb-md">
      <div class="q-mr-lg">
        <ni-input in-modal caption="PU TTC" @blur="validations.unitInclTaxes.$touch" required-field
          :value="newManualBill.unitInclTaxes" @input="update($event, 'unitInclTaxes')" type="number"
          :error="validations.unitInclTaxes.$error" :error-message="nbrError('unitInclTaxes', validations)" />
        <div class="total-text">Total HT : {{ formatPrice(totalExclTaxes) }}</div>
      </div>
      <div>
        <ni-input in-modal caption="Quantité" @blur="validations.count.$touch" required-field
          :value="newManualBill.count" @input="update($event, 'count')" type="number" :error="validations.count.$error"
          :error-message="nbrError('count', validations)" />
        <div class="total-text">Total TTC : {{ formatPrice(totalInclTaxes) }}</div>
      </div>
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer la facture" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import DateInput from '@components/form/DateInput';
import { REQUIRED_LABEL } from '@data/constants';
import { formatPrice } from '@helpers/utils';
import { configMixin } from 'src/modules/client/mixins/configMixin';

export default {
  name: 'ManualBillCreationModal',
  mixins: [configMixin],
  components: {
    'ni-select': Select,
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-modal': Modal,
  },
  props: {
    newManualBill: { type: Object, default: () => ({}) },
    value: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    customersOptions: { type: Array, default: () => ([]) },
    billingItemsOptions: { type: Array, default: () => ([]) },
    billingItems: { type: Array, default: () => ([]) },
  },
  data () {
    return {
      formatPrice,
      selectedBillingItem: null,
    };
  },
  computed: {
    totalExclTaxes () {
      return this.selectedBillingItem ? this.totalInclTaxes / (1 + this.selectedBillingItem.vat / 100) : 0;
    },
    totalInclTaxes () {
      return this.selectedBillingItem ? this.newManualBill.unitInclTaxes * this.newManualBill.count : 0;
    },
  },
  methods: {
    nbrError (path, validations = this.$v) {
      const val = get(validations, path);
      if (val.required === false) return REQUIRED_LABEL;
      if (val.positiveNumber === false || val.strictPositiveNumber === false) return 'Nombre non valide';

      return '';
    },
    hide (partialReset, type) {
      this.$emit('hide', { partialReset, type });
    },
    input (event) {
      this.$emit('input', event);
    },
    submit (value) {
      this.$emit('submit', value);
    },
    async updateBillingItem (event) {
      this.selectedBillingItem = this.billingItems.find(bi => bi._id === event);
      const defaultUnitAmount = this.selectedBillingItem ? this.selectedBillingItem.defaultUnitAmount : 0;
      await this.update(defaultUnitAmount, 'unitInclTaxes');
      await this.update(event, 'billingItem');
    },
    async update (event, prop) {
      await this.$emit('update:newManualBill', { ...this.newManualBill, [prop]: event });
    },
  },
};
</script>

<style lang="stylus" scoped>
.total-text
  font-size: 14px
</style>
