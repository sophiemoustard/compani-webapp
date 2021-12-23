<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template #title>
      Créer une <span class="text-weight-bold">facture manuelle</span>
    </template>
    <ni-date-input caption="Date" :value="newManualBill.date" in-modal required-field
      @input="update($event, 'date')" :error="validations.date.$error" @blur="validations.date.$touch" />
    <ni-select in-modal caption="Bénéficiaire" :value="newManualBill.customer"
      @input="update($event, 'customer')" :options="customersOptions" required-field
      @blur="validations.customer.$touch" :error="validations.customer.$error" />
    <div v-for="(item, index) of newManualBill.billingItemList" :key="index">
      <div class="row">
        <ni-select in-modal :caption="`Article ${index + 1}`" @input="updateBillingItem($event, index, 'billingItem')"
          :error="validations.billingItemList.$each[index].billingItem.$error" :value="item.billingItem" required-field
          @blur="validations.billingItemList.$each[index].billingItem.$touch" :options="billingItemsOptions"
          class="flex-1" />
        <ni-button icon="close" size="12px" @click="removeBillingItem(index)"
          :disable="newManualBill.billingItemList.length === 1" />
      </div>
      <div class="flex-row">
        <div class="q-mr-sm">
          <ni-input caption="PU TTC" @input="updateBillingItem($event, index, 'unitInclTaxes')"
            :error-message="nbrError('unitInclTaxes', index)" :value="item.unitInclTaxes" required-field
            :error="validations.billingItemList.$each[index].unitInclTaxes.$error" type="number"
            @blur="validations.billingItemList.$each[index].unitInclTaxes.$touch" />
          </div>
        <div class="q-ml-sm">
          <ni-input caption="Quantité" :value="item.count" @input="updateBillingItem($event, index, 'count')"
            :error="validations.billingItemList.$each[index].count.$error" type="number" required-field
            @blur="validations.billingItemList.$each[index].count.$touch" :error-message="nbrError('count', index)" />
        </div>
      </div>
    </div>
    <ni-bi-color-button label="Ajouter un article" icon="add" class="q-mb-md" @click="addBillingItem"
      label-color="primary" />
    <div class="row q-mb-md">
      <div class="col-6 total-text">Total HT : {{ formatPrice(totalExclTaxes) }}</div>
      <div class="col-6 total-text">Total TTC : {{ formatPrice(newManualBill.netInclTaxes) }}</div>
    </div>
    <template #footer>
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
import Button from '@components/Button';
import BiColorButton from '@components/BiColorButton';
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
    'ni-button': Button,
    'ni-bi-color-button': BiColorButton,
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
      totalExclTaxes: 0,
    };
  },
  watch: {
    'newManualBill.billingItemList': {
      deep: true,
      handler () {
        this.totalExclTaxes = this.newManualBill.billingItemList
          .reduce(
            (acc, bi) => (bi.billingItem ? acc + this.getExclTaxes(bi.unitInclTaxes, bi.vat) * bi.count : acc),
            0
          );
      },
    },
  },
  methods: {
    getExclTaxes (inclTaxes, vat) {
      return inclTaxes / (1 + vat / 100);
    },
    nbrError (path, index) {
      const val = get(this.validations, `billingItemList.$each.${index}.${path}`);
      if (val.required === false) return REQUIRED_LABEL;
      if (val.positiveNumber === false || val.strictPositiveNumber === false) return 'Nombre non valide';

      return '';
    },
    hide () {
      this.totalExclTaxes = 0;
      this.selectedBillingItem = null;
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit (value) {
      this.$emit('submit', value);
    },
    async updateBillingItem (event, index, path) {
      await this.$emit('update-billing-item', event, index, path);
    },
    async removeBillingItem (index) {
      await this.$emit('remove-billing-item', index);
    },
    async update (event, prop) {
      await this.$emit('update:newManualBill', { ...this.newManualBill, [prop]: event });
    },
    addBillingItem () {
      this.$emit('add-billing-item');
    },
  },
};
</script>

<style lang="sass" scoped>
.total-text
  font-size: 14px
</style>
