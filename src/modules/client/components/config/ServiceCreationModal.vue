<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      Créer un <span class="text-weight-bold">service</span>
    </template>
    <ni-input in-modal caption="Nom" :value="newService.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field @input="update($event, 'name')" />
    <ni-select in-modal caption="Nature" :value="newService.nature" :error="validations.nature.$error"
      @blur="validations.nature.$touch" :options="natureOptions" required-field @input="update($event, 'nature')" />
    <ni-input in-modal caption="Prix unitaire par défaut TTC" @input="update($event, 'defaultUnitAmount')"
      :value="newService.defaultUnitAmount" :error="validations.defaultUnitAmount.$error" required-field
      @blur="validations.defaultUnitAmount.$touch" :error-message="defaultUnitAmountError" suffix="€" type="number" />
    <ni-input in-modal caption="TVA" suffix="%" :value="newService.vat" type="number" @input="update($event, 'vat')"
      :error="validations.vat.$error" @blur="validations.vat.$touch"
      error-message="La TVA doit être positive ou nulle" />
    <ni-select in-modal v-if="newService.nature !== FIXED" caption="Plan de majoration" :value="newService.surcharge"
      :options="surchargesOptions" @input="update($event, 'surcharge')" />
    <div class="row q-mb-md">
      <q-checkbox label="Exonération de charges" :value="newService.exemptFromCharges" dense
        @input="update($event, 'exemptFromCharges')" />
    </div>
    <p class="text-weight-bold q-mt-md billing-items-title" v-if="get(newService, 'billingItems.length')">
      Articles facturés par intervention
    </p>
    <div class="row" v-for="(billingItem, index) in newService.billingItems" :key="index">
      <ni-select :clearable="false" :value="billingItem" :options="billingItemsOptions"
        :caption="`Article ${index + 1}`" class="flex-1 q-mr-sm" @input="updateBillingItem(index, $event)" />
      <ni-button icon="close" @click="removeBillingItem(index)" size="sm" />
    </div>
    <ni-bi-color-button label="Ajouter un article de facturation" icon="add" class="q-mb-md" @click="addBillingItem"
      label-color="primary" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer le service" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import BiColorButton from '@components/BiColorButton';
import Button from '@components/Button';
import Modal from '@components/modal/Modal';
import { FIXED } from '@data/constants';

export default {
  name: 'ServiceCreationModal',
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-select': Select,
    'ni-bi-color-button': BiColorButton,

  },
  props: {
    validations: { type: Object, required: true },
    value: { type: Boolean, default: false },
    newService: { type: Object, required: true },
    natureOptions: { type: Array, required: true },
    surchargesOptions: { type: Array, required: true },
    defaultUnitAmountError: { type: String, required: true },
    loading: { type: Boolean, default: false },
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
      this.$emit('update:newService', { ...this.newService, [prop]: event });
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

<style lang="stylus" scoped>
  .billing-items-title
    font-size: 14px
</style>
