<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Éditer le <span class="text-weight-bold">service</span>
    </template>
    <ni-input in-modal caption="Nom" :value="editedService.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field @input="update($event, 'name')" />
    <ni-date-input caption="Date d'effet" :value="editedService.startDate" :error="validations.startDate.$error"
      @blur="validations.startDate.$touch" :min="minStartDate" in-modal required-field
      @input="update($event, 'startDate')" :error-message="startDateError" />
    <ni-input in-modal caption="Prix unitaire par défaut TTC" suffix="€" type="number"
      :value="editedService.defaultUnitAmount" :error="validations.defaultUnitAmount.$error" required-field
      @blur="validations.defaultUnitAmount.$touch" :error-message="defaultUnitAmountError"
      @input="update($event, 'defaultUnitAmount')" />
    <ni-input in-modal caption="TVA" suffix="%" :value="editedService.vat" :error="validations.vat.$error"
      type="number" @blur="validations.vat.$touch" error-message="La TVA doit être positive ou nulle"
      @input="update($event, 'vat')" />
    <ni-select in-modal v-if="editedService.nature !== FIXED" caption="Plan de majoration"
      :value="editedService.surcharge" :options="surchargesOptions" @input="update($event, 'surcharge')" />
    <div class="row q-mb-md">
      <q-checkbox label="Exonération de charges" :value="editedService.exemptFromCharges" dense
        @input="update($event, 'exemptFromCharges')" />
    </div>
    <p class="text-weight-bold q-mt-md billing-items-title" v-if="get(editedService, 'billingItems.length')">
      Articles facturés par intervention
    </p>
    <div class="row" v-for="(billingItem, index) in editedService.billingItems" :key="index">
      <ni-select :clearable="false" :value="billingItem" :options="billingItemsOptions"
        :caption="`Article ${index + 1}`" class="flex-1 q-mr-sm" @input="updateBillingItem(index, $event)" />
      <ni-button icon="close" @click="removeBillingItem(index)" size="sm" />
    </div>
    <ni-bi-color-button label="Ajouter un article de facturation" icon="add" class="q-mb-md" @click="addBillingItem"
      label-color="primary" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Editer le service" icon-right="check" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import DateInput from '@components/form/DateInput';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import BiColorButton from '@components/BiColorButton';
import Button from '@components/Button';
import Modal from '@components/modal/Modal';
import { FIXED } from '@data/constants';

export default {
  name: 'ServiceEditionModal',
  components: {
    'ni-date-input': DateInput,
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-button': Button,
    'ni-bi-color-button': BiColorButton,
  },
  props: {
    validations: { type: Object, required: true },
    value: { type: Boolean, default: false },
    editedService: { type: Object, required: true },
    surchargesOptions: { type: Array, required: true },
    defaultUnitAmountError: { type: String, required: true },
    startDateError: { type: String, required: true },
    loading: { type: Boolean, default: false },
    minStartDate: { type: String, required: true },
    billingItemsOptions: { type: Array, required: true },
  },
  data () {
    return {
      FIXED,
    };
  },
  methods: {
    get,
    hide () {
      this.$emit('hide');
    },
    input () {
      this.$emit('input');
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:editedService', { ...this.editedService, [prop]: event });
    },
    addBillingItem () {
      this.$emit('add-billing-item');
    },
    updateBillingItem (index, event) {
      this.$emit('update-billing-item', index, event);
    },
    removeBillingItem (index) {
      this.$emit('remove-billing-item', index);
    },
  },
};
</script>

<style lang="sass" scoped>
  .billing-items-title
    font-size: 14px
</style>
