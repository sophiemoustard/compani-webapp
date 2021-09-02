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
    <ni-select in-modal caption="Article" :value="newManualBill.billingItem"
      @input="update($event, 'billingItem')" :options="billingItemsOptions" required-field
      @blur="validations.billingItem.$touch" :error="validations.billingItem.$error" />
    <ni-input in-modal caption="PU TTC" @blur="validations.unitInclTaxes.$touch" required-field
      :value="newManualBill.unitInclTaxes" @input="update($event, 'unitInclTaxes')" type="number"
      :error="validations.unitInclTaxes.$error" :error-message="nbrError('unitInclTaxes', validations)" />
    <ni-input in-modal caption="Quantité" @blur="validations.count.$touch" required-field
      :value="newManualBill.count" @input="update($event, 'count')" type="number"
      :error="validations.count.$error" :error-message="nbrError('count', validations)" />
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
      this.$emit('update:newManualBill', { ...this.newManualBill, [prop]: event });
    },
  },
};
</script>
