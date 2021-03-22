<template>
  <ni-modal :value="value" @input="input" @hide="hide" container-class="modal-container-md">
    <template slot="title">
      Créer un <span class="text-weight-bold">avoir</span>
    </template>
    <ni-select in-modal caption="Bénéficiaire" v-model="newCreditNote.customer" :options="customersOptions"
      required-field @input="getEvents('customer')" @blur="validations.customer.$touch" clearable
      :error="validations.customer.$error" />
    <ni-select caption="Tiers payeur" v-model="newCreditNote.thirdPartyPayer" @input="getEvents('thirdPartyPayer')"
      :options="thirdPartyPayerOptions" :disable="thirdPartyPayerOptions.length === 0" clearable in-modal />
    <ni-date-input caption="Date de l'avoir" v-model="newCreditNote.date" :error="validations.date.$error"
      @blur="validations.date.$touch" in-modal required-field />
    <div class="row q-mb-md light">
      <q-toggle :value="hasLinkedEvents" @input="updateHasLinkedEvents" label="Lié à des interventions ?" />
    </div>
    <!-- Has linked events -->
    <template v-if="hasLinkedEvents">
      <ni-date-input caption="Début période concernée" v-model="newCreditNote.startDate" required-field in-modal
        :error="validations.startDate.$error" @blur="validations.startDate.$touch" @input="getEvents('startDate')"
        :disable="!hasLinkedEvents" :error-message="startDateErrorMessage" :max="minAndMaxDates.startDate" />
      <ni-date-input caption="Fin période concernée" v-model="newCreditNote.endDate" required-field in-modal
        :error="validations.endDate.$error" @blur="validations.endDate.$touch" @input="getEvents('endDate')"
        :disable="!hasLinkedEvents" :error-message="endDateErrorMessage" :min="minAndMaxDates.endDate" />
      <template v-if="creditNoteEvents.length > 0">
        <ni-option-group v-model="newCreditNote.events" :options="creditNoteEventsOptions" caption="Évènements"
          type="checkbox" required-field inline :error="validations.events.$error" />
      </template>
      <div v-if="newCreditNoteHasNoEvents" class="light warning">
        <p>Il n'y a aucune intervention facturée pour le bénéficiaire aux dates données</p>
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
    <!-- Hasn't linked event -->
    <template v-else>
      <ni-select in-modal caption="Souscription concernée" :options="subscriptionsOptions" required-field
        v-model="newCreditNote.subscription" :disable="!hasLinkedEvents && !newCreditNote.customer"
        :error="validations.subscription.$error" @blur="validations.subscription.$touch" />
      <ni-input in-modal v-if="!newCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
        v-model="newCreditNote.inclTaxesCustomer" required-field :error="validations.inclTaxesCustomer.$error"
        @blur="validations.inclTaxesCustomer.$touch" :error-message="inclTaxesError" />
      <ni-input in-modal v-if="newCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
        v-model="newCreditNote.inclTaxesTpp" required-field :error="validations.inclTaxesTpp.$error"
        @blur="validations.inclTaxesTpp.$touch" :error-message="inclTaxesError" />
    </template>
    <template slot="footer">
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
import { formatPrice, formatIdentity } from '@helpers/utils';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'CreditNoteCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newCreditNote: { type: Object, default: () => ({}) },
    hasLinkedEvents: { type: Boolean, default: false },
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
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    getEvents (value) {
      this.$emit('get-events', value);
    },
    updateHasLinkedEvents (value) {
      this.$emit('update:hasLinkedEvents', value);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .light
    font-size: 14px;

  .warning
    color: $red;
</style>
