<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
      Créer une <span class="text-weight-bold">facture manuelle</span>
    </template>
    <ni-date-input caption="Date" :model-value="newManualBill.date" in-modal required-field
      @update:model-value="update($event, 'date')" :error="validations.date.$error" @blur="validations.date.$touch" />
    <ni-select in-modal caption="Bénéficiaire" :model-value="newManualBill.customer"
      @update:model-value="update($event, 'customer')" :options="customersOptions" required-field
      @blur="validations.customer.$touch" :error="validations.customer.$error" />
    <div v-for="(item, index) of newManualBill.billingItemList" :key="index">
      <div class="row">
        <ni-select in-modal @update:model-value="updateBillingItem($event, index, 'billingItem')" required-field
          :caption="`Article ${index + 1}`" :model-value="item.billingItem" :options="billingItemsOptions"
          @blur="validations.billingItemList.$touch" :error="getError('billingItem', index)" class="flex-1" />
        <ni-button icon="close" size="12px" @click="removeBillingItem(index)"
          :disable="newManualBill.billingItemList.length === 1" />
      </div>
      <div class="flex-row">
        <div class="q-mr-sm">
          <ni-input caption="PU TTC" @update:model-value="updateBillingItem($event, index, 'unitInclTaxes')"
            :error-message="getErrorMessage('unitInclTaxes', index)" :model-value="item.unitInclTaxes" required-field
            :error="getError('unitInclTaxes', index)" type="number" @blur="validations.billingItemList.$touch" />
          </div>
        <div class="q-ml-sm">
          <ni-input caption="Quantité" :model-value="item.count" type="number" required-field
            @update:model-value="updateBillingItem($event, index, 'count')" :error="getError('count', index)"
            @blur="validations.billingItemList.$touch" :error-message="getErrorMessage('count', index)" />
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
import { multiply, add, divide } from '@helpers/numbers';
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
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    customersOptions: { type: Array, default: () => ([]) },
    billingItemsOptions: { type: Array, default: () => ([]) },
    billingItems: { type: Array, default: () => ([]) },
  },
  emits: [
    'update:model-value',
    'hide',
    'submit',
    'remove-billing-item',
    'update-billing-item',
    'update:new-manual-bill',
    'add-billing-item',
  ],
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
        this.totalExclTaxes = this.newManualBill.billingItemList.reduce(
          (acc, bi) => (bi.billingItem
            ? add(acc, multiply(this.getExclTaxes(bi.unitInclTaxes, bi.vat), bi.count))
            : acc
          ),
          0
        );
      },
    },
  },
  methods: {
    getError (path, index) {
      const validation = this.validations.billingItemList.$each.$response.$errors[index];

      return this.validations.billingItemList.$dirty && get(validation, `${path}.0.$response`) === false;
    },
    getErrorMessage (path, index) {
      const validation = this.validations.billingItemList.$each.$response.$errors[index];
      if (get(validation, `${path}.0.$validator`) === 'required') return REQUIRED_LABEL;
      if (get(validation, `${path}.0.$validator`) === 'positiveNumber' ||
        get(validation, `${path}.0.$validator`) === 'strictPositiveNumber' ||
        get(validation, `${path}.0.$validator`) === 'twoFractionDigits' ||
        get(validation, `${path}.0.$validator`) === 'fourFractionDigits') return 'Nombre non valide';

      return '';
    },
    getExclTaxes (inclTaxes, vat) {
      return divide(inclTaxes, add(1, divide(vat, 100)));
    },
    hide () {
      this.totalExclTaxes = 0;
      this.selectedBillingItem = null;
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
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
      await this.$emit('update:new-manual-bill', { ...this.newManualBill, [prop]: event });
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
