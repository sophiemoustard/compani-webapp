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
      <!-- Has linked events -->
      <template v-if="hasLinkedEvents">
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
      <!-- Hasn't linked event -->
      <template v-else>
        <ni-select in-modal caption="Souscription concernée" :model-value="editedCreditNote.subscription"
          :options="subscriptionsOptions" :disable="!hasLinkedEvents && !editedCreditNote.customer" required-field
          :error="validations.subscription.$error" @blur="validations.subscription.$touch"
          @update:model-value="update($event, 'subscription')" />
        <ni-input in-modal v-if="!editedCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€" type="number"
          :model-value="editedCreditNote.inclTaxesCustomer" :error="validations.inclTaxesCustomer.$error"
          @blur="validations.inclTaxesCustomer.$touch" :error-message="inclTaxesError" required-field
          @update:model-value="update($event, 'inclTaxesCustomer')" />
        <ni-input in-modal v-if="editedCreditNote.thirdPartyPayer" caption="Montant TTC" suffix="€"
          :model-value="editedCreditNote.inclTaxesTpp" required-field :error="validations.inclTaxesTpp.$error"
          @blur="validations.inclTaxesTpp.$touch" :error-message="inclTaxesError" type="number"
          @update:model-value="update($event, 'inclTaxesTpp')" />
      </template>
      <template v-if="editedCreditNote.isEditable" #footer>
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
    modelValue: { type: Boolean, default: false },
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
  emits: ['hide', 'submit', 'get-events', 'update:edited-credit-note', 'update:model-value'],
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
  },
};
</script>

<style lang="sass" scoped>
  .light
    font-size: 14px
</style>
