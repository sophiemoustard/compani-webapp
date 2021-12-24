<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
      Créer un <span class="text-weight-bold">service</span>
    </template>
    <ni-input in-modal caption="Nom" :model-value="newService.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field @update:model-value="update($event, 'name')" />
    <ni-select in-modal caption="Nature" :model-value="newService.nature" :error="validations.nature.$error"
      @blur="validations.nature.$touch" :options="natureOptions" @update:model-value="update($event, 'nature')"
      required-field />
    <ni-input in-modal caption="Prix unitaire par défaut TTC" @update:model-value="update($event, 'defaultUnitAmount')"
      :model-value="newService.defaultUnitAmount" :error="validations.defaultUnitAmount.$error" required-field
      @blur="validations.defaultUnitAmount.$touch" :error-message="defaultUnitAmountError" suffix="€" type="number" />
    <ni-input in-modal caption="TVA" suffix="%" type="number" @update:model-value="update($event, 'vat')"
      :error="validations.vat.$error" @blur="validations.vat.$touch" :model-value="newService.vat"
      error-message="La TVA doit être positive ou nulle" />
    <ni-select in-modal v-if="newService.nature !== FIXED" :model-value="newService.surcharge"
      :options="surchargesOptions" @update:model-value="update($event, 'surcharge')" caption="Plan de majoration" />
    <div class="row q-mb-md">
      <q-checkbox label="Exonération de charges" :model-value="newService.exemptFromCharges" dense
        @update:model-value="update($event, 'exemptFromCharges')" />
    </div>
    <p class="text-weight-bold q-mt-md billing-items-title" v-if="get(newService, 'billingItems.length')">
      Articles facturés par intervention
    </p>
    <div class="row" v-for="(billingItem, index) in newService.billingItems" :key="index">
      <ni-select :clearable="false" :model-value="billingItem" :options="billingItemsOptions" class="flex-1 q-mr-sm"
        :caption="`Article ${index + 1}`" @update:model-value="updateBillingItem(index, $event)" />
      <ni-button icon="close" @click="removeBillingItem(index)" size="sm" />
    </div>
    <ni-bi-color-button label="Ajouter un article de facturation" icon="add" class="q-mb-md" @click="addBillingItem"
      label-color="primary" />
    <template #footer>
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
    modelValue: { type: Boolean, default: false },
    newService: { type: Object, required: true },
    natureOptions: { type: Array, required: true },
    surchargesOptions: { type: Array, required: true },
    defaultUnitAmountError: { type: String, required: true },
    loading: { type: Boolean, default: false },
    billingItemsOptions: { type: Array, required: true },
  },
  emits: [
    'update:model-value',
    'hide',
    'submit',
    'update:newService',
    'add-billing-item',
    'update-billing-item',
    'remove-billing-item',
  ],
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
      this.$emit('update:model-value');
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

<style lang="sass" scoped>
  .billing-items-title
    font-size: 14px
</style>
