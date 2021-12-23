<template>
  <ni-modal :value="value" @input="input" @hide="hide" container-class="modal-container-md">
      <template #title>
        Editer un <span class="text-weight-bold">avoir</span>
      </template>
      <ni-input in-modal caption="Bénéficiaire" :value="formatIdentity(editedCreditNote.customer.identity, 'FL')"
        required-field disable />
      <ni-input in-modal v-if="editedCreditNote.thirdPartyPayer" caption="Tiers payeur" required-field disable
        :value="editedCreditNote.thirdPartyPayer.name" />
      <ni-date-input caption="Date de l'avoir" :value="editedCreditNote.date" in-modal required-field
        :error="validations.date.$error" @blur="validations.date.$touch" :disable="!editedCreditNote.isEditable"
        @input="update($event, 'date')" />
      <!-- Has linked events -->
      <template v-if="hasLinkedEvents">
        <ni-date-input caption="Début période concernée" :value="editedCreditNote.startDate" in-modal required-field
          :disable="!editedCreditNote.events || !editedCreditNote.isEditable" @input="getEvents($event, 'startDate')"
          :error="validations.startDate.$error" @blur="validations.$touch" :max="minAndMaxDates.maxStartDate"
          :error-message="startDateErrorMessage" />
        <ni-date-input caption="Fin période concernée" :value="editedCreditNote.endDate" in-modal
          :disable="!editedCreditNote.events || !editedCreditNote.isEditable" @input="getEvents($event, 'endDate')"
          required-field :error="validations.endDate.$error" @blur="validations.$touch" :min="minAndMaxDates.minEndDate"
          :error-message="endDateErrorMessage" />
        <template v-if="creditNoteEvents.length > 0">
          <ni-option-group :value="editedCreditNote.events" :options="creditNoteEventsOptions" caption="Évènements"
            type="checkbox" required-field inline :disable="!editedCreditNote.isEditable"
            :error="validations.events.$error" @input="update($event, 'events')" />
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
      <!-- Hasn't linked event -->
      <template v-else>
        <ni-select in-modal caption="Souscription concernée" :value="editedCreditNote.subscription"
          :options="subscriptionsOptions" :disable="!hasLinkedEvents && !editedCreditNote.customer" required-field
          :error="validations.subscription.$error" @blur="validations.subscription.$touch"
          @input="update($event, 'subscription')" />
        <ni-input in-modal v-if="!editedCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
          :value="editedCreditNote.inclTaxesCustomer" :error="validations.inclTaxesCustomer.$error"
          @blur="validations.inclTaxesCustomer.$touch" :error-message="inclTaxesError" required-field
          @input="update($event, 'inclTaxesCustomer')" />
        <ni-input in-modal v-if="editedCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€"
          :value="editedCreditNote.inclTaxesTpp" required-field :error="validations.inclTaxesTpp.$error"
          @blur="validations.inclTaxesTpp.$touch" :error-message="inclTaxesError" type="number"
          @input="update($event, 'inclTaxesTpp')" />
      </template>
      <template v-if="editedCreditNote.isEditable" slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer l'avoir" icon-right="add" color="primary"
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
  name: 'CreditNoteEditionModal',
  props: {
    value: { type: Boolean, default: false },
    editedCreditNote: { type: Object, default: () => ({}) },
    hasLinkedEvents: { type: Boolean, default: false },
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
    editedCreditNoteHasNoEvents () {
      return this.editedCreditNote.customer && this.editedCreditNote.startDate && this.editedCreditNote.endDate &&
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
    getEvents (event, value) {
      this.update(event, value);
      this.$emit('get-events', value);
    },
    update (event, prop) {
      this.$emit('update:editedCreditNote', { ...this.editedCreditNote, [prop]: event });
    },
  },
};
</script>

<style lang="sass" scoped>
  .light
    font-size: 14px
</style>
