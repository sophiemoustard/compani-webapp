<template>
  <q-dialog v-if="Object.keys(editedEvent).length !== 0" :value="editionModal" @hide="hide">
    <div class="modal-container-md">
      <div class="modal-padding">
        <ni-planning-modal-header v-if="isCustomerPlanning" v-model="editedEvent.customer"
          :selected-person="selectedCustomer" @close="close" />
        <ni-planning-modal-header v-else-if="[UNAVAILABILITY, ABSENCE].includes(editedEvent.type)" :options="[]"
          v-model="editedEvent.auxiliary" :selected-person="selectedAuxiliary" @close="close" />
        <ni-planning-modal-header v-else v-model="editedEvent.auxiliary" :options="auxiliariesOptions"
          :selected-person="selectedAuxiliary" @close="close" />
        <div class="modal-subtitle">
          <q-btn-toggle no-wrap v-model="editedEvent.type" toggle-color="primary" rounded unelevated
            :options="eventType" />
          <q-btn icon="delete" @click="isRepetition(editedEvent) ? deleteEventRepetition() : deleteEvent()" no-caps flat
            color="grey" v-if="!isDisabled" data-cy="event-deletion-button" />
        </div>
        <template v-if="editedEvent.type !== ABSENCE">
          <ni-datetime-range caption="Dates et heures de l'évènement" v-model="editedEvent.dates" required-field
            :disable="isDisabled" :error="validations.dates.$error" @blur="validations.dates.$touch" disable-end-date />
        </template>
        <template v-if="editedEvent.type === INTERVENTION">
          <ni-select v-if="isCustomerPlanning" in-modal caption="Auxiliaire" v-model="editedEvent.auxiliary"
            :options="auxiliariesOptions" :error="validations.auxiliary.$error" required-field
            @blur="validations.auxiliary.$touch" />
          <ni-select v-else in-modal caption="Bénéficiaire" v-model="editedEvent.customer" :options="customersOptions"
            :error="validations.customer.$error" required-field disable />
          <ni-select in-modal caption="Service" :options="customerSubscriptionsOptions"
            v-model="editedEvent.subscription" :error="validations.subscription.$error"
            @blur="validations.subscription.$touch" required-field :disable="isDisabled" />
        </template>
        <template v-if="editedEvent.type === INTERNAL_HOUR">
          <ni-select in-modal caption="Type d'heure interne" v-model="editedEvent.internalHour"
            :options="internalHourOptions" :error="validations.internalHour.$error"
            @blur="validations.internalHour.$touch" />
          <ni-search-address v-model="editedEvent.address" in-modal @blur="validations.address.$touch"
            :error="validations.address.$error" :error-message="addressError" />
        </template>
        <template v-if="isRepetition(editedEvent) && !isDisabled && !editedEvent.isCancelled">
          <div class="row q-mb-md light-checkbox">
            <q-checkbox v-model="editedEvent.shouldUpdateRepetition" label="Appliquer à la répétition"
              @input="toggleRepetition" dense />
          </div>
        </template>
        <template v-if="editedEvent.type === ABSENCE">
          <ni-select in-modal caption="Nature" v-model="editedEvent.absenceNature" :options="absenceNatureOptions"
            :error="validations.absenceNature.$error" required-field disable />
          <ni-select in-modal caption="Type d'absence" v-model="editedEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" required-field @blur="validations.absence.$touch"
            :disable="isHourlyAbsence(editedEvent)" @input="setDateHours(editedEvent, 'editedEvent')" />
          <ni-datetime-range caption="Dates et heures de l'évènement" v-model="editedEvent.dates" required-field
            :disable-end-date="isHourlyAbsence(editedEvent)" :error="validations.dates.$error"
            @blur="validations.dates.$touch" :disable-end-hour="isDailyAbsence(editedEvent)"
            :disable-start-hour="!isIllnessOrWorkAccident(editedEvent)" />
          <ni-file-uploader v-if="isIllnessOrWorkAccident(editedEvent)" caption="Justificatif d'absence" required-field
            path="attachment" :entity="editedEvent" alt="justificatif absence" name="file" :url="docsUploadUrl"
            @uploaded="documentUploaded" :additional-value="additionalValue" :disable="!selectedAuxiliary._id"
            :error="validations.attachment.$error" @delete="deleteDocument(editedEvent.attachment.driveId)" in-modal
            :extensions="extensions" drive-storage />
        </template>
        <ni-input in-modal v-if="!editedEvent.shouldUpdateRepetition" v-model="editedEvent.misc" caption="Notes"
          :disable="isDisabled" @blur="validations.misc.$touch" :error="validations.misc.$error"
          :required-field="isMiscRequired" />
        <template v-if="editedEvent.type === INTERVENTION && !editedEvent.shouldUpdateRepetition && !isDisabled">
          <div class="row q-mb-md light-checkbox">
            <q-checkbox v-model="editedEvent.isCancelled" label="Annuler l'évènement" @input="toggleCancellationForm"
              dense />
          </div>
          <div class="row justify-between">
            <ni-select in-modal v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.condition" required-field
              caption="Conditions" :options="cancellationConditions" @blur="validations.cancel.condition.$touch"
              :error="validations.cancel.condition.$error" />
            <ni-select in-modal v-if="editedEvent.isCancelled" v-model="editedEvent.cancel.reason" caption="Motif"
              :options="cancellationReasons" required-field @blur="validations.cancel.reason.$touch"
              :error="validations.cancel.reason.$error" />
          </div>
        </template>
      </div>
      <div v-if="editedEvent.type === INTERVENTION && customerAddressList(editedEvent).length > 0"
        class="customer-info">
        <div class="row items-center no-wrap">
          <q-select borderless dense v-model="editedEvent.address" @input="deleteClassFocus" emit-value behavior="menu"
            :options="customerAddressList(editedEvent)" :readonly="customerAddressList(editedEvent).length === 1"
            :display-value="editedEvent.address.fullAddress" ref="addressSelect">
            <template #append v-if="customerAddressList(editedEvent).length > 1">
              <ni-button icon="swap_vert" class="select-icon pink-icon" @click.stop="toggleAddressSelect" />
            </template>
          </q-select>
          <q-btn flat size="md" color="primary" icon="mdi-information-outline" :to="customerProfileRedirect" />
        </div>
      </div>
      <q-btn v-if="!isDisabled" class="modal-btn full-width" no-caps color="primary" :loading="loading"
        label="Editer l'évènement" @click="submit" icon-right="check" data-cy="event-edition-button" />
    </div>
  </q-dialog>
</template>

<script>
import { formatIdentity } from '@helpers/utils';
import { INTERVENTION, ABSENCE, OTHER, NEVER } from '@data/constants';
import { planningModalMixin } from 'src/modules/client/mixins/planningModalMixin';
import Button from '@components/Button';

export default {
  name: 'EventEditionModal',
  mixins: [planningModalMixin],
  props: {
    editedEvent: { type: Object, default: () => ({}) },
    editionModal: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    activeAuxiliaries: { type: Array, default: () => [] },
    customers: { type: Array, default: () => [] },
    internalHours: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    personKey: { type: String, default: () => '' },
  },
  components: {
    'ni-button': Button,
  },
  computed: {
    selectedCustomer () {
      if (!this.editedEvent.customer) return {};
      return this.customers.find(customer => customer._id === this.editedEvent.customer);
    },
    selectedAuxiliary () {
      if (!this.editedEvent.auxiliary || !this.activeAuxiliaries.length) return { identity: {} };
      const aux = this.activeAuxiliaries.find(a => a._id === this.editedEvent.auxiliary);
      const hasContractOnEvent = this.hasContractOnEvent(aux, this.editedEvent.dates.startDate);

      return { ...aux, hasContractOnEvent };
    },
    eventType () {
      return this.eventTypeOptions.filter(option => option.value === this.editedEvent.type);
    },
    isDisabled () {
      return this.editedEvent.type === INTERVENTION && this.editedEvent.isBilled;
    },
    auxiliaryFilterPlaceholder () {
      return this.selectedAuxiliary.identity
        ? formatIdentity(this.selectedAuxiliary.identity, 'FL')
        : 'À affecter';
    },
    isMiscRequired () {
      return (this.editedEvent.type === ABSENCE && this.editedEvent.absence === OTHER) || this.editedEvent.isCancelled;
    },
  },
  methods: {
    toggleCancellationForm (value) {
      if (!value) this.$emit('update:edited-event', { ...this.editedEvent, cancel: {} });
      else {
        this.validations.misc.$touch();
        this.validations.cancel.$touch();
      }
    },
    toggleRepetition () {
      this.$emit('update:edited-event', { ...this.editedEvent, cancel: {}, isCancelled: false });
    },
    isRepetition (event) {
      return ABSENCE !== event.type && event.repetition && event.repetition.frequency !== NEVER;
    },
    close () {
      this.$emit('close');
    },
    hide (partialReset, type) {
      this.$emit('hide', { partialReset, type });
    },
    deleteDocument (value) {
      this.$emit('delete-document', value);
    },
    documentUploaded (value) {
      this.$emit('document-uploaded', value);
    },
    submit (value) {
      this.$emit('submit', value);
    },
    deleteEventRepetition (value) {
      this.$emit('delete-event-repetition', value);
    },
    deleteEvent (value) {
      this.$emit('delete-event', value);
    },
    toggleAddressSelect () {
      const addressList = this.customerAddressList(this.editedEvent);
      const addressIndex = addressList.findIndex(ev => this.editedEvent.address.fullAddress === ev.label);
      if (addressIndex === 0) this.editedEvent.address = addressList[1].value;
      else this.editedEvent.address = addressList[0].value;
    },
  },
};
</script>

<style lang="stylus" scoped>
  .modal-subtitle
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
    /deep/ .q-btn-toggle
      margin-bottom: 0;
      width: 33%;
      @media screen and (max-width: 767px)
        width: 100%

  .light-checkbox
    color: $grey-400
    font-size: 14px

</style>
