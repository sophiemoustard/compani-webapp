<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide" container-class="modal-container-md">
    <template #title>
      Créer un <span class="text-weight-bold">avoir</span>
    </template>
    <ni-btn-toggle :model-value="creditNoteType" :options="CREDIT_NOTE_TYPE_OPTIONS"
      @update:model-value="updateCreditNoteType" />
    <ni-select in-modal caption="Bénéficiaire" :model-value="newCreditNote.customer" :options="customersOptions"
      required-field @update:model-value="updateCustomer" @blur="validations.customer.$touch"
      :error="validations.customer.$error" />
    <ni-select caption="Tiers payeur" @update:model-value="getEvents($event, 'thirdPartyPayer')"
      in-modal :disable="thirdPartyPayerOptions.length === 0" :model-value="newCreditNote.thirdPartyPayer"
      :options="thirdPartyPayerOptions" />
    <ni-date-input caption="Date de l'avoir" :model-value="newCreditNote.date" :error="validations.date.$error"
      @blur="validations.date.$touch" in-modal required-field @update:model-value="update($event, 'date')" />
    <ni-input caption="Motif" in-modal v-model="tmpInput" @blur="updateMisc" type="textarea" />
    <!-- Event -->
    <template v-if="creditNoteType === EVENTS">
      <ni-date-input @blur="validations.startDate.$touch" :max="minAndMaxDates.maxStartDate" in-modal
        :error="validations.startDate.$error" caption="Début période concernée" :model-value="newCreditNote.startDate"
        @update:model-value="getEvents($event, 'startDate')" :error-message="startDateErrorMessage" required-field />
      <ni-date-input caption="Fin période concernée" :model-value="newCreditNote.endDate" required-field in-modal
        :error="validations.endDate.$error" @blur="validations.endDate.$touch" :min="minAndMaxDates.minEndDate"
        @update:model-value="getEvents($event, 'endDate')" :error-message="endDateErrorMessage" />
      <template v-if="creditNoteEvents.length > 0">
        <ni-option-group :model-value="newCreditNote.events" :options="creditNoteEventsOptions" caption="Évènements"
          type="checkbox" required-field inline :error="validations.events.$error"
          @update:model-value="update($event, 'events')" />
      </template>
      <div v-if="newCreditNoteHasNoEvents" class="text-orange-700">
        <p>Il n'y a aucune intervention facturée pour le/la bénéficiaire aux dates données.</p>
      </div>
      <div class="row justify-between items-baseline">
        <div class="col-6 light">
          <p v-if="newCreditNote.exclTaxesCustomer">
            Montant HT bénéficiaire : {{ formatPrice(newCreditNote.exclTaxesCustomer) }}
          </p>
          <p v-if="newCreditNote.exclTaxesTpp">
            Montant HT tiers-payeur : {{ formatPrice(newCreditNote.exclTaxesTpp) }}
          </p>
        </div>
        <div class="col-6 light">
          <p v-if="newCreditNote.inclTaxesCustomer">
            Montant TTC bénéficiaire : {{ formatPrice(newCreditNote.inclTaxesCustomer) }}
          </p>
          <p v-if="newCreditNote.inclTaxesTpp">
            Montant TTC tiers-payeur : {{ formatPrice(newCreditNote.inclTaxesTpp) }}
          </p>
        </div>
      </div>
    </template>
    <!-- Subscription -->
    <template v-else>
      <ni-select in-modal caption="Souscription concernée" :options="subscriptionsOptions" required-field
        :model-value="newCreditNote.subscription" :disable="!newCreditNote.customer"
        :error="validations.subscription.$error" @blur="validations.subscription.$touch"
        @update:model-value="update($event, 'subscription')" />
      <ni-input in-modal v-if="!newCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
        :model-value="newCreditNote.inclTaxesCustomer" required-field :error="validations.inclTaxesCustomer.$error"
        @blur="validations.inclTaxesCustomer.$touch" :error-message="inclTaxesError"
        @update:model-value="update($event, 'inclTaxesCustomer')" />
      <ni-input in-modal v-if="newCreditNote.thirdPartyPayer" @update:model-value="update($event, 'inclTaxesTpp')"
        :model-value="newCreditNote.inclTaxesTpp" required-field :error="validations.inclTaxesTpp.$error" type="number"
        @blur="validations.inclTaxesTpp.$touch" :error-message="inclTaxesError" caption="Montant TTC" suffix="€" />
    </template>
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'avoir" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import DateInput from '@components/form/DateInput';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import Modal from '@components/modal/Modal';
import ButtonToggle from '@components/ButtonToggle';
import { REQUIRED_LABEL, CREDIT_NOTE_TYPE_OPTIONS, SUBSCRIPTION, EVENTS } from '@data/constants';
import { formatPrice, formatIdentity } from '@helpers/utils';

export default {
  name: 'CreditNoteCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newCreditNote: { type: Object, default: () => ({}) },
    creditNoteType: { type: String, default: '' },
    thirdPartyPayerOptions: { type: Array, default: () => [] },
    customersOptions: { type: Array, default: () => [] },
    subscriptionsOptions: { type: Array, default: () => [] },
    creditNoteEvents: { type: Array, default: () => [] },
    creditNoteEventsOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    startDateErrorMessage: { type: String, default: REQUIRED_LABEL },
    endDateErrorMessage: { type: String, default: REQUIRED_LABEL },
    minAndMaxDates: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-option-group': OptionGroup,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-btn-toggle': ButtonToggle,
  },
  emits: [
    'hide',
    'submit',
    'update:model-value',
    'get-events',
    'update:has-linked-events',
    'update:new-credit-note',
    'reset-customer-data',
    'update:credit-note-type',
  ],
  data () {
    return {
      tmpInput: '',
      CREDIT_NOTE_TYPE_OPTIONS,
      SUBSCRIPTION,
      EVENTS,
    };
  },
  computed: {
    newCreditNoteHasNoEvents () {
      return this.newCreditNote.customer && this.newCreditNote.startDate && this.newCreditNote.endDate &&
        !this.creditNoteEvents.length;
    },
    inclTaxesError () {
      return 'Montant TTC non valide';
    },
  },
  methods: {
    formatPrice,
    formatIdentity,
    hide () {
      this.$emit('hide');
      this.tmpInput = '';
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    getEvents (event, prop) {
      this.update(event, prop);
      this.$emit('get-events', prop);
    },
    update (event, prop) {
      this.$emit('update:new-credit-note', { ...this.newCreditNote, [prop]: event });
    },
    updateCustomer (event) {
      this.update(event, 'customer');
      this.$emit('reset-customer-data');
      this.$emit('get-events', 'customer');
    },
    updateMisc () {
      this.$emit('update:new-credit-note', { ...this.newCreditNote, misc: this.tmpInput });
    },
    updateCreditNoteType (event) {
      this.$emit('update:credit-note-type', event);
      this.tmpInput = '';
    },
  },
};
</script>

<style lang="sass" scoped>
  .light
    font-size: 14px
</style>
