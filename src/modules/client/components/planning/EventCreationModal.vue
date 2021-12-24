<template>
  <q-dialog v-if="Object.keys(newEvent).length !== 0" :model-value="creationModal" @hide="reset(false)">
    <div class="modal-container-md">
      <div class="modal-padding">
        <ni-planning-modal-header v-if="isCustomerPlanning" :value="newEvent.customer"
          :selected-person="selectedCustomer" @close="close" />
        <ni-planning-modal-header v-else :value="newEvent.auxiliary" :options="auxiliariesOptions"
          :selected-person="selectedAuxiliary" @close="close" @update:sector="updateSectorEvent"
          @update:value="updateEvent('auxiliary', $event)" />
        <ni-btn-toggle :model-value="newEvent.type" :options="eventTypeOptions"
          @update:model-value="updateType($event)" />
        <!-- <template v-if="newEvent.type !== ABSENCE">
          <ni-datetime-range caption="Dates et heures de l'évènement" :value="newEvent.dates" required-field
            :error="validations.dates.$error" @blur="validations.dates.$touch" disable-end-date
            @input="updateEvent('dates', $event)" :max="customerStoppedDate" />
        </template> -->
        <!-- <template v-if="newEvent.type === INTERVENTION">
          <ni-select v-if="isCustomerPlanning" in-modal caption="Auxiliaire" :value="newEvent.auxiliary"
            :options="auxiliariesOptions" :error="validations.auxiliary.$error" required-field
            @blur="validations.auxiliary.$touch" @input="updateEvent('auxiliary', $event)" />
          <ni-select v-else in-modal caption="Bénéficiaire" :value="newEvent.customer"
            :options="getCustomersOptions(newEvent.dates.startDate)" :error="validations.customer.$error" required-field
            @blur="validations.customer.$touch" @input="updateCustomer($event)" data-cy="event-creation-customer" />
          <ni-select in-modal caption="Service" :value="newEvent.subscription" :error="validations.subscription.$error"
            :options="customerSubscriptionsOptions" required-field @blur="validations.subscription.$touch"
            data-cy="event-creation-service" @input="updateEvent('subscription', $event)" />
        </template> -->
        <!-- <template v-if="newEvent.type === ABSENCE">
          <ni-select in-modal caption="Nature" :value="newEvent.absenceNature" :options="absenceNatureOptions"
            :error="validations.absenceNature.$error" required-field @blur="validations.absenceNature.$touch"
            @input="updateAbsenceNature($event)" />
          <ni-select in-modal caption="Type d'absence" :value="newEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" required-field @blur="validations.absence.$touch"
            :disable="isHourlyAbsence(newEvent)" @input="updateAbsence($event)" />
          <ni-datetime-range caption="Dates et heures de l'évènement" :value="newEvent.dates" required-field
            :disable-end-date="isHourlyAbsence(newEvent)" :error="validations.dates.$error"
            @blur="validations.dates.$touch" :disable-end-hour="isDailyAbsence(newEvent)"
            :disable-start-hour="!isIllnessOrWorkAccident(newEvent) && !isHourlyAbsence(newEvent)"
            @input="updateEvent('dates', $event)" />
          <q-checkbox v-show="canExtendAbsence" class="q-mb-sm" :value="newEvent.isExtendedAbsence"
            @input="updateCheckBox" label="Prolongation" dense />
          <ni-select v-if="newEvent.isExtendedAbsence" :value="newEvent.extension"
            @input="updateEvent('extension', $event)" required-field in-modal caption="Absence"
            :options="extendedAbsenceOptions" @blur="validations.extension.$touch"
            :error="validations.extension.$error" />
          <ni-file-uploader v-if="isIllnessOrWorkAccident(newEvent)" caption="Justificatif d'absence" path="attachment"
            :entity="newEvent" name="file" :url="docsUploadUrl" @uploaded="documentUploaded" :extensions="extensions"
            :additional-value="additionalValue" required-field in-modal :disable="!selectedAuxiliary._id" drive-storage
            :error="validations.attachment.link.$error" @delete="deleteDocument(newEvent.attachment.driveId)" />
        </template> -->
        <!-- <template v-if="newEvent.type === INTERNAL_HOUR">
          <ni-select in-modal caption="Type d'heure interne" :value="newEvent.internalHour"
            :options="internalHourOptions" required-field :error="validations.internalHour.$error"
            @blur="validations.internalHour.$touch" @input="updateEvent('internalHour', $event)" />
        </template> -->
        <!-- <template v-if="newEvent.type !== ABSENCE && newEvent.repetition">
          <ni-select in-modal caption="Répétition de l'évènement" :value="newEvent.repetition.frequency"
            :options="repetitionOptions" required-field @blur="validations.repetition.frequency.$touch"
            :disable="!isRepetitionAllowed" @input="updateEvent('repetition.frequency', $event)"
            :error="validations.repetition.frequency.$error" />
        </template> -->
        <!-- <template v-if="newEvent.type === INTERNAL_HOUR">
          <ni-search-address :value="newEvent.address" :error-message="addressError" @blur="validations.address.$touch"
            :error="validations.address.$error" in-modal @input="updateEvent('address', $event)" />
        </template> -->
        <ni-input in-modal type="textarea" :value="newEvent.misc" caption="Notes" @blur="validations.misc.$touch"
          :error="validations.misc.$error" :required-field="newEvent.type === ABSENCE && newEvent.absence === OTHER"
          @update:value="updateEvent('misc', $event)" />
      </div>
      <div v-if="newEvent.type === INTERVENTION && customerAddressList(newEvent).length > 0" class="customer-info">
        <!-- <div class="row items-center no-wrap">
          <q-select borderless dense :value="newEvent.address" @input="updateCustomerAddress($event)" emit-value
            :options="customerAddressList(newEvent)" :readonly="customerAddressList(newEvent).length === 1"
            :display-value="newEvent.address.fullAddress" ref="addressSelect" behavior="menu">
            <template #append v-if="customerAddressList(newEvent).length > 1">
              <ni-button icon="swap_vert" class="select-icon primary-icon" @click.stop="toggleAddressSelect" />
            </template>
          </q-select>
        </div> -->
      </div>
      <q-btn class="full-width modal-btn" no-caps :loading="loading" label="Créer l'évènement" color="primary"
        @click="submit" icon-right="add" data-cy="event-creation-button" />
    </div>
  </q-dialog>
</template>

<script>
import get from 'lodash/get';
import Events from '@api/Events';
import Button from '@components/Button';
import ButtonToggle from '@components/ButtonToggle';
import {
  ABSENCE,
  INTERNAL_HOUR,
  HOURLY,
  UNJUSTIFIED,
  INTERVENTION,
  NEVER,
  MATERNITY_LEAVE,
  PATERNITY_LEAVE,
  PARENTAL_LEAVE,
  WORK_ACCIDENT,
  TRANSPORT_ACCIDENT,
  ILLNESS,
} from '@data/constants';
import moment from '@helpers/moment';
import { planningModalMixin } from 'src/modules/client/mixins/planningModalMixin';

export default {
  name: 'EventCreationModal',
  mixins: [planningModalMixin],
  props: {
    newEvent: { type: Object, default: () => ({}) },
    creationModal: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    activeAuxiliaries: { type: Array, default: () => [] },
    customers: { type: Array, default: () => [] },
    internalHours: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    personKey: { type: String, default: () => '' },
  },
  components: {
    'ni-button': Button,
    'ni-btn-toggle': ButtonToggle,
  },
  data () {
    return {
      extendedAbsenceOptions: [],
    };
  },
  computed: {
    isEndDurationRequired () {
      if (this.newEvent.type !== ABSENCE) return false;

      return moment(this.newEvent.dates.endDate).isAfter(moment(this.newEvent.dates.startDate));
    },
    isContractValidForRepetition () {
      if (!this.selectedAuxiliary.contracts || this.selectedAuxiliary.contracts.length === 0) return false;

      return this.selectedAuxiliary.contracts.some(contract => !contract.endDate);
    },
    isRepetitionAllowed () {
      if (!this.newEvent.auxiliary) return true;
      if (this.newEvent.auxiliary !== '') return this.isContractValidForRepetition;

      return true;
    },
    selectedCustomer () {
      if (!this.newEvent.customer) return { identity: {} };
      return this.customers.find(customer => customer._id === this.newEvent.customer);
    },
    selectedAuxiliary () {
      if (!this.newEvent.auxiliary || !this.activeAuxiliaries.length) return { identity: {} };
      const aux = this.activeAuxiliaries.find(a => a._id === this.newEvent.auxiliary);
      const hasContractOnEvent = this.hasContractOnEvent(aux, this.newEvent.dates.startDate);

      return { ...aux, hasContractOnEvent };
    },
    canExtendAbsence () {
      return [
        MATERNITY_LEAVE,
        PATERNITY_LEAVE,
        PARENTAL_LEAVE,
        WORK_ACCIDENT,
        TRANSPORT_ACCIDENT,
        ILLNESS,
      ].includes(this.newEvent.absence);
    },
    customerStoppedDate () {
      return get(this.selectedCustomer, 'stoppedAt') || '';
    },
  },
  watch: {
    selectedAuxiliary (value) {
      if (!this.selectedAuxiliary.hasContractOnEvent && this.newEvent.type === INTERNAL_HOUR) {
        this.updateEvent('type', INTERVENTION);
      }
    },
    isRepetitionAllowed (value) {
      if (!value) {
        this.updateEvent('repetition.frequency', NEVER);
      }
    },
    'newEvent.absence': function () {
      this.getAbsences();
    },
    'newEvent.dates.startDate': function () {
      this.getAbsences();
    },
  },
  methods: {
    updateEvent (path, value) {
      this.$emit('update-event', { path, value });
    },
    close () {
      this.$emit('close');
    },
    reset (partialReset, type) {
      this.extendedAbsenceOptions = [];
      this.$emit('reset', { partialReset, type });
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
    resetAbsenceType () {
      if (this.newEvent.type === ABSENCE && this.newEvent.absenceNature === HOURLY) {
        this.updateEvent('absence', UNJUSTIFIED);
      }
    },
    updateSectorEvent (auxId) {
      const auxiliary = this.activeAuxiliaries.find(aux => aux._id === auxId);
      this.updateEvent('sector', get(auxiliary, 'sector._id', ''));
    },
    setEventAddressAndSubscription () {
      const cusSubNotArchived = this.customerSubscriptionsOptions.filter(sub => !sub.disable);
      if (cusSubNotArchived.length === 1) this.updateEvent('subscription', get(cusSubNotArchived[0], 'value'));
      this.updateEvent('address', get(this.selectedCustomer, 'contact.primaryAddress', {}));
    },
    toggleAddressSelect () {
      const addressList = this.customerAddressList(this.newEvent);
      const addressIndex = addressList.findIndex(ev => this.newEvent.address.fullAddress === ev.label);
      if (addressIndex === 0) this.updateEvent('address', addressList[1].value);
      else this.updateEvent('address', addressList[0].value);
    },
    updateCustomer (event) {
      this.updateEvent('customer', event);
      this.setEventAddressAndSubscription();
    },
    updateType (event) {
      this.updateEvent('type', event);
      this.reset(true, event);
    },
    updateAbsenceNature (event) {
      this.updateEvent('absenceNature', event);
      this.updateEvent('extension', '');
      this.updateEvent('isExtendedAbsence', false);
      this.resetAbsenceType();
    },
    updateAbsence (event) {
      this.updateEvent('absence', event);
      this.updateEvent('isExtendedAbsence', false);
      this.setDateHours(this.newEvent, 'newEvent');
    },
    updateCustomerAddress (event) {
      this.updateEvent('address', event);
      this.deleteClassFocus();
    },
    async updateCheckBox (event) {
      if (!this.newEvent.isExtendedAbsence) await this.getAbsences();
      this.updateEvent('isExtendedAbsence', !this.newEvent.isExtendedAbsence);
    },
    async getAbsences () {
      this.updateEvent('extension', '');
      const auxiliaryEvents = await Events.list({ auxiliary: this.selectedAuxiliary._id, type: ABSENCE });

      this.extendedAbsenceOptions = auxiliaryEvents
        .filter(e => e.absence === this.newEvent.absence &&
            moment(e.startDate).isBefore(this.newEvent.dates.startDate))
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        .map(a => ({
          label: `${moment(a.startDate).format('DD/MM/YYYY')} - ${moment(a.endDate).format('DD/MM/YYYY')}`,
          value: a._id,
        }));
    },
  },
};
</script>
