<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide" container-class="modal-container-md">
      <template #title>
        Editer un <span class="text-weight-bold">avoir</span>
      </template>
      <ni-input in-modal caption="Bénéficiaire" :model-value="formatIdentity(editedCreditNote.customer.identity, 'FL')"
        required-field disable />
      <ni-input in-modal v-if="editedCreditNote.thirdPartyPayer" caption="Tiers payeur" required-field disable
        :model-value="editedCreditNote.thirdPartyPayer.name" />
      <ni-date-input caption="Date de l'avoir" :model-value="editedCreditNote.date" in-modal required-field
        :error="validations.date.$error" @blur="validations.date.$touch" :disable="!editedCreditNote.isEditable"
        @update:model-value="update($event, 'date')" />
      <ni-input caption="Motif" in-modal :model-value="editedCreditNote.misc" type="textarea" :debounce="500"
        @update:model-value="update($event, 'misc')" />
      <!-- Events -->
      <template v-if="creditNoteType === EVENTS">
        <ni-date-input caption="Début période concernée" :model-value="editedCreditNote.startDate" in-modal
          :disable="!editedCreditNote.events || !editedCreditNote.isEditable" required-field
          :error="validations.startDate.$error" @blur="validations.$touch" :max="minAndMaxDates.maxStartDate"
          :error-message="startDateErrorMessage" @update:model-value="getEvents($event, 'startDate')" />
        <ni-date-input caption="Fin période concernée" :model-value="editedCreditNote.endDate" in-modal
          :disable="!editedCreditNote.events || !editedCreditNote.isEditable" :error-message="endDateErrorMessage"
          required-field :error="validations.endDate.$error" @blur="validations.$touch" :min="minAndMaxDates.minEndDate"
          @update:model-value="getEvents($event, 'endDate')" />
        <template v-if="creditNoteEvents.length > 0">
          <ni-option-group :model-value="editedCreditNote.events" :options="creditNoteEventsOptions"
            type="checkbox" required-field inline :disable="!editedCreditNote.isEditable" caption="Évènements"
            :error="validations.events.$error" @update:model-value="update($event, 'events')" />
        </template>
        <div v-if="editedCreditNoteHasNoEvents" class="light text-orange-700">
          <p>Il n'y a aucune intervention facturée pour le/la bénéficiaire aux dates données.</p>
        </div>
        <div class="row justify-between items-baseline">
          <div class="col-6 light">
            <p v-if="editedCreditNote.exclTaxesCustomer">
              Montant HT bénéficiaire : {{ formatPrice(editedCreditNote.exclTaxesCustomer) }}
            </p>
            <p v-if="editedCreditNote.exclTaxesTpp">
              Montant HT tiers-payeur : {{ formatPrice(editedCreditNote.exclTaxesTpp) }}
            </p>
          </div>
          <div class="col-6 light">
            <p v-if="editedCreditNote.inclTaxesCustomer">
              Montant TTC bénéficiaire : {{ formatPrice(editedCreditNote.inclTaxesCustomer) }}
            </p>
            <p v-if="editedCreditNote.inclTaxesTpp">
              Montant TTC tiers-payeur : {{ formatPrice(editedCreditNote.inclTaxesTpp) }}
            </p>
          </div>
        </div>
      </template>
      <!-- Subscription -->
      <template v-else-if="creditNoteType === SUBSCRIPTION">
        <ni-select in-modal caption="Souscription concernée" :model-value="editedCreditNote.subscription"
          :options="subscriptionsOptions" :disable="!editedCreditNote.customer" required-field
          :error="validations.subscription.$error" @blur="validations.subscription.$touch"
          @update:model-value="update($event, 'subscription')" />
        <ni-input in-modal v-if="!editedCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
          :model-value="editedCreditNote.inclTaxesCustomer" :error="validations.inclTaxesCustomer.$error"
          @blur="validations.inclTaxesCustomer.$touch" error-message="Montant TTC non valide" required-field
          @update:model-value="update($event, 'inclTaxesCustomer')" />
        <ni-input in-modal v-if="editedCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€"
          :model-value="editedCreditNote.inclTaxesTpp" required-field :error="validations.inclTaxesTpp.$error"
          @blur="validations.inclTaxesTpp.$touch" error-message="Montant TTC non valide" type="number"
          @update:model-value="update($event, 'inclTaxesTpp')" />
      </template>
      <!-- Billing items -->
      <template v-else>
        <div v-for="(item, index) of editedCreditNote.billingItemList" :key="index">
          <div class="row">
            <ni-select in-modal @update:model-value="updateBillingItem($event, index, 'billingItem')" required-field
              :caption="`Article ${index + 1}`" :model-value="item.billingItem" :options="billingItemsOptions"
              class="flex-1" @blur="validations.billingItemList.$touch"
              :error="getBillingItemError('billingItem', index)" />
            <ni-button icon="close" size="12px" @click="removeBillingItem(index)"
              :disable="editedCreditNote.billingItemList.length === 1" />
          </div>
          <div :class="['row', !$q.platform.is.mobile && 'gutter-profile']">
            <ni-input caption="PU TTC" @update:model-value="updateBillingItem($event, index, 'unitInclTaxes')"
              :model-value="item.unitInclTaxes" :error="getBillingItemError('unitInclTaxes', index)"
              :error-message="getBillingItemErrorMessage('unitInclTaxes', index)" required-field type="number" />
            <ni-input caption="Quantité" :error-message="getBillingItemErrorMessage('count', index)"
              @update:model-value="updateBillingItem($event, index, 'count')" @blur="validations.billingItemList.$touch"
              :error="getBillingItemError('count', index)" :model-value="item.count" type="number" required-field />
          </div>
        </div>
        <ni-bi-color-button label="Ajouter un article" icon="add" class="q-mb-md" @click="addBillingItem"
          label-color="primary" />
        <div class="row q-mb-md">
          <div class="col-6 total-text">Total HT : {{ formatPrice(editedCreditNote.exclTaxesCustomer) }}</div>
          <div class="col-6 total-text">Total TTC : {{ formatPrice(editedCreditNote.inclTaxesCustomer) }}</div>
        </div>
      </template>
      <template v-if="editedCreditNote.isEditable" #footer>
        <q-btn no-caps class="full-width modal-btn" label="Editer l'avoir" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import get from 'lodash/get';
import Button from '@components/Button';
import BiColorButton from '@components/BiColorButton';
import DateInput from '@components/form/DateInput';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import Modal from '@components/modal/Modal';
import { formatPrice, formatIdentity } from '@helpers/utils';
import { REQUIRED_LABEL, EVENTS, SUBSCRIPTION } from '@data/constants';

export default {
  name: 'CreditNoteEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    editedCreditNote: { type: Object, default: () => ({}) },
    creditNoteType: { type: String, default: '' },
    subscriptionsOptions: { type: Array, default: () => [] },
    creditNoteEvents: { type: Array, default: () => [] },
    creditNoteEventsOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    startDateErrorMessage: { type: String, default: REQUIRED_LABEL },
    endDateErrorMessage: { type: String, default: REQUIRED_LABEL },
    minAndMaxDates: { type: Object, default: () => ({}) },
    billingItemsOptions: { type: Array, default: () => ([]) },
  },
  data () {
    return {
      EVENTS,
      SUBSCRIPTION,
    };
  },
  components: {
    'ni-option-group': OptionGroup,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-bi-color-button': BiColorButton,
    'ni-button': Button,
  },
  emits: [
    'hide',
    'submit',
    'get-events',
    'update:edited-credit-note',
    'update:model-value',
    'add-billing-item',
    'update-billing-item',
    'remove-billing-item',
  ],
  computed: {
    editedCreditNoteHasNoEvents () {
      return this.editedCreditNote.customer && this.editedCreditNote.startDate && this.editedCreditNote.endDate &&
        !this.creditNoteEvents.length;
    },
  },
  methods: {
    formatPrice,
    formatIdentity,
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    getEvents (event, value) {
      this.update(event, value);
      this.$emit('get-events', value);
    },
    update (event, prop) {
      this.$emit('update:edited-credit-note', { ...this.editedCreditNote, [prop]: event });
    },
    addBillingItem () {
      this.$emit('add-billing-item');
    },
    updateBillingItem (event, index, path) {
      this.$emit('update-billing-item', event, index, path);
    },
    removeBillingItem (index) {
      this.$emit('remove-billing-item', index);
    },
    getBillingItemError (path, index) {
      const validation = this.validations.billingItemList.$each.$response.$errors[index];

      return this.validations.billingItemList.$dirty && get(validation, `${path}.0.$response`) === false;
    },
    getBillingItemErrorMessage (path, index) {
      const validation = this.validations.billingItemList.$each.$response.$errors[index];
      if (get(validation, `${path}.0.$validator`) === 'required') return REQUIRED_LABEL;

      const invalidNumber = get(validation, `${path}.0.$validator`) === 'positiveNumber' ||
        get(validation, `${path}.0.$validator`) === 'strictPositiveNumber' ||
        get(validation, `${path}.0.$validator`) === 'fractionDigits';
      if (invalidNumber) return 'Nombre non valide';

      return '';
    },
  },
};
</script>

<style lang="sass" scoped>
  .light
    font-size: 14px
</style>
