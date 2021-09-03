<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      Créer une <span class="text-weight-bold">facture manuelle</span>
    </template>
    <ni-date-input caption="Date de la facture" :value="newManualBill.date" in-modal required-field
      @input="update($event, 'date')" :error="validations.date.$error" @blur="validations.date.$touch" />
    <ni-select in-modal caption="Bénéficiaire" :value="newManualBill.customer"
      @input="update($event, 'customer')" :options="customersOptions" required-field
      @blur="validations.customer.$touch" :error="validations.customer.$error" />
    <ni-select in-modal caption="Article" :value="newManualBill.billingItem" @blur="validations.billingItem.$touch"
      @input="updateBillingItem($event)" :options="billingItemsOptions" :error="validations.billingItem.$error"
      required-field />
    <div class="flex-row">
      <ni-input class="inputUnitPrice" in-modal caption="PU TTC" @blur="validations.unitInclTaxes.$touch" required-field
        :value="newManualBill.unitInclTaxes" @input="update($event, 'unitInclTaxes')" type="number"
        :error="validations.unitInclTaxes.$error" :error-message="nbrError('unitInclTaxes', validations)" />
      <ni-input class="inputCount" in-modal caption="Quantité" @blur="validations.count.$touch" required-field
        :value="newManualBill.count" @input="update($event, 'count')" type="number"
        :error="validations.count.$error" :error-message="nbrError('count', validations)" />
    </div>
    <div class="q-mb-md">
      <span class="q-mr-xl" style="font-size: 0.8rem">Total HT : {{ totalExclTaxes }}</span>
      <span style="font-size: 0.8rem">Total TTC : {{ totalInclTaxes }}</span>
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer la facture" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import DateInput from '@components/form/DateInput';
import { configMixin } from 'src/modules/client/mixins/configMixin';

export default {
  name: 'PaymentEditionModal',
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
      selectedBillingItem: null,
    };
  },
  computed: {
    totalExclTaxes () {
      if (!this.selectedBillingItem) return '0 €';

      return `${parseFloat(
        this.newManualBill.unitInclTaxes / (1 - this.selectedBillingItem.vat * 0.01) * this.newManualBill.count
      ).toFixed(2)} €`;
    },
    totalInclTaxes () {
      if (!this.selectedBillingItem) return '0 €';

      return `${parseFloat(this.newManualBill.unitInclTaxes * this.newManualBill.count).toFixed(2)} €`;
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
    async updateBillingItem (event) {
      this.selectedBillingItem = this.billingItems.find(bi => bi._id === event);
      const defaultUnitAmount = this.selectedBillingItem ? this.selectedBillingItem.defaultUnitAmount : 0;
      await this.update(defaultUnitAmount, 'unitInclTaxes');
      await this.update(event, 'billingItem');
    },
    update (event, prop) {
      this.$emit('update:newManualBill', { ...this.newManualBill, [prop]: event });
    },
  },
};
</script>

<style lang="stylus" scoped>
.inputUnitPrice
  max-width: 120px
  margin-right: 32px !important
.inputCount
  max-width: 120px
</style>
