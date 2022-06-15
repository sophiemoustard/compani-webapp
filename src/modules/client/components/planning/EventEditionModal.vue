<template>
  <q-dialog :model-value="editionModal" @hide="hide">
    <div class="modal-container-md">
      <div class="modal-padding">
        <ni-planning-modal-header v-if="isCustomerPlanning" :model-value="editedEvent.customer"
          :selected-person="selectedCustomer" @close="close" />
        <ni-planning-modal-header v-else-if="[UNAVAILABILITY, ABSENCE].includes(editedEvent.type)"
          :model-value="editedEvent.auxiliary" :selected-person="selectedAuxiliary" @close="close" />
        <ni-planning-modal-header v-else :model-value="editedEvent.auxiliary" :selected-person="selectedAuxiliary"
          @update:model-value="updateEvent('auxiliary', $event)" :options="auxiliariesOptions" @close="close"
          :disable="!canUpdateAuxiliary || historiesLoading" />
        <div class="modal-subtitle">
          <q-btn rounded unelevated color="primary" :label="eventTypeLabel" />
          <div class="modal-subtitle">
            <ni-button v-if="canCancel && !editedEvent.isCancelled" label="Annuler l'intervention"
              color="copper-grey-800" class="bg-copper-grey-100" @click="openEventCancellationModal()" />
            <q-btn icon="delete" @click="isRepetition(editedEvent) ? deleteEventRepetition() : deleteEvent()" no-caps
              flat color="copper-grey-400" v-if="canUpdateIntervention" data-cy="event-deletion-button"
              :disable="historiesLoading" />
          </div>
        </div>
        <template v-if="editedEvent.type !== ABSENCE">
          <ni-datetime-range caption="Dates et heures de l'évènement" :model-value="editedEvent.dates" required-field
            :disable="!canUpdateIntervention || historiesLoading" :error="validations.dates.$error" disable-end-date
            @update:model-value="updateEvent('dates', $event)" @blur="validations.dates.$touch"
            :disable-start-date="isEventTimeStamped" :max="customerStoppedDate"
            :disable-start-hour="!!startDateTimeStamped" :disable-end-hour="!!endDateTimeStamped"
            :start-locked="!!startDateTimeStamped" @start-lock-click="openTimeStampCancellationModal(true)"
            :end-locked="!!endDateTimeStamped" @end-lock-click="openTimeStampCancellationModal(false)" />
        </template>
        <template v-if="editedEvent.type === INTERVENTION">
          <ni-select v-if="isCustomerPlanning" in-modal caption="Auxiliaire" :model-value="editedEvent.auxiliary"
            :options="auxiliariesOptions" :error="validations.auxiliary.$error" required-field
            @blur="validations.auxiliary.$touch" @update:model-value="updateEvent('auxiliary', $event)"
            :disable="!canUpdateAuxiliary || historiesLoading" />
          <ni-select v-else in-modal caption="Bénéficiaire" :model-value="editedEvent.customer"
            :options="getCustomersOptions(editedEvent.dates.startDate)" :error="validations.customer.$error"
            required-field disable />
          <ni-select :options="customerSubscriptionsOptions" @update:model-value="updateEvent('subscription', $event)"
            :model-value="editedEvent.subscription" :error="validations.subscription.$error" caption="Service" in-modal
            @blur="validations.subscription.$touch" :disable="!canUpdateIntervention || historiesLoading"
            required-field />
          <ni-select in-modal caption="Répétition de l'évènement" :model-value="editedEvent.repetition.frequency"
            :options="getRepetitionOptions(editedEvent.dates.startDate)" disable />
        </template>
        <template v-if="editedEvent.type === INTERNAL_HOUR">
          <ni-select in-modal caption="Type d'heure interne" :model-value="editedEvent.internalHour"
            :options="internalHourOptions" :error="validations.internalHour.$error" :disable="historiesLoading"
            @blur="validations.internalHour.$touch" @update:model-value="updateEvent('internalHour', $event)" />
          <ni-search-address :model-value="editedEvent.address" in-modal @blur="validations.address.$touch"
            :error="validations.address.$error" @update:model-value="updateEvent('address', $event)"
            :disable="historiesLoading" :error-message="addressError" />
        </template>
        <template v-if="isRepetition(editedEvent) && !editedEvent.isCancelled && editedEvent.type !== INTERVENTION">
          <div class="row q-mb-md light-checkbox">
            <q-checkbox :model-value="editedEvent.shouldUpdateRepetition" label="Appliquer à la répétition"
              @update:model-value="toggleRepetition" dense :disable="historiesLoading" />
          </div>
        </template>
        <template v-if="editedEvent.type === ABSENCE">
          <div v-if="!!editedEvent.extension"><div class="q-mb-md infos">{{ extensionInfos }}</div></div>
          <ni-select in-modal caption="Nature" :model-value="editedEvent.absenceNature" :options="absenceNatureOptions"
            :error="validations.absenceNature.$error" required-field disable />
          <ni-select in-modal caption="Type d'absence" :model-value="editedEvent.absence" :options="ABSENCE_TYPES"
            :error="validations.absence.$error" required-field @blur="validations.absence.$touch"
            :disable="isHourlyAbsence(editedEvent) || historiesLoading" @update:model-value="updateAbsence($event)" />
          <ni-datetime-range caption="Dates et heures de l'évènement" :model-value="editedEvent.dates" required-field
            :disable-end-date="isAbsenceEndDateDisabled" :disable-start-hour="isAbsenceStartHourDisabled"
            @blur="validations.dates.$touch" :disable-end-hour="isDailyAbsence(editedEvent)" :disable="historiesLoading"
            :error="validations.dates.$error" @update:model-value="updateEvent('dates', $event)" />
          <ni-file-uploader v-if="isIllnessOrWorkAccident(editedEvent)" caption="Justificatif d'absence" required-field
            path="attachment" :entity="editedEvent" name="file" :url="docsUploadUrl"
            @uploaded="documentUploaded" :additional-value="additionalValue" :error="validations.attachment.$error"
            :disable="!selectedAuxiliary._id || historiesLoading" in-modal :extensions="extensions" drive-storage
            @delete="deleteDocument(editedEvent.attachment.driveId)" />
        </template>
        <ni-input in-modal type="textarea" :model-value="editedEvent.misc" v-if="!editedEvent.shouldUpdateRepetition"
          caption="Notes" :disable="!canUpdateIntervention || historiesLoading" @blur="validations.misc.$touch"
          :error="validations.misc.$error" :required-field="isMiscRequired"
          @update:model-value="updateEvent('misc', $event)" />
        <div v-if="editedEvent.isCancelled" class="row justify-between">
          <ni-select in-modal :model-value="editedEvent.cancel.condition" caption="Conditions d'annulation"
            :options="cancellationConditions" @blur="validations.cancel.condition.$touch" required-field
            :error="validations.cancel.condition.$error" @update:model-value="updateEvent('cancel.condition', $event)"
            disable />
          <ni-select in-modal :model-value="editedEvent.cancel.reason" caption="Motif d'annulation"
            :options="cancellationReasons" required-field @blur="validations.cancel.reason.$touch"
            :error="validations.cancel.reason.$error" @update:model-value="updateEvent('cancel.reason', $event)"
            disable />
        </div>
        <template v-if="editedEvent.type === INTERVENTION">
          <ni-input in-modal caption="Déplacement véhiculé avec bénéficiaire" :model-value="editedEvent.kmDuringEvent"
            suffix="km" type="number" :error="validations.kmDuringEvent.$error" @blur="validations.kmDuringEvent.$touch"
            error-message="Le déplacement doit être positif ou nul" :disable="!canUpdateIntervention"
            @update:model-value="updateEvent('kmDuringEvent', $event)" />
          <ni-select in-modal :model-value="editedEvent.transportMode" :options="eventTransportOptions"
            caption="Transport spécifique pour aller à l'intervention" :disable="!canUpdateIntervention"
            @update:model-value="updateEvent('transportMode', $event)" />
        </template>
        <div class="q-mb-lg">
          <div class="flex-row items-center justify-between">
            <div class="flex-row items-center">
              <q-icon size="sm" name="history" class="q-mr-sm" color="copper-grey-500" />
              <div class="text-14 text-weight-bold">Activité</div>
            </div>
            <ni-button :label="historyButtonLabel" color="copper-grey-800" class="bg-copper-grey-100"
              @click="toggleHistory" :disable="historiesLoading" />
          </div>
          <div v-if="displayHistory" class="q-mt-sm">
            <ni-event-history v-for="history in eventHistories" :key="history._id" :history="history" />
          </div>
        </div>
      </div>
      <div v-if="editedEvent.type === INTERVENTION && customerAddressList(editedEvent).length > 0"
        class="customer-info">
        <div class="row items-center no-wrap">
          <q-select borderless dense :model-value="editedEvent.address" @update:model-value="updateAddress" emit-value
            :options="customerAddressList(editedEvent)" :readonly="customerAddressList(editedEvent).length === 1"
            :display-value="editedEvent.address.fullAddress" ref="addressSelect" behavior="menu"
            :disable="!canUpdateIntervention || historiesLoading">
            <template #append v-if="customerAddressList(editedEvent).length > 1">
              <ni-button icon="swap_vert" class="select-icon primary-icon" @click.stop="toggleAddressSelect"
              :disable="!canUpdateIntervention" />
            </template>
          </q-select>
          <q-btn flat size="md" color="primary" icon="mdi-information-outline" :to="customerProfileRedirect" />
        </div>
      </div>
      <q-btn v-if="canUpdateIntervention" class="modal-btn full-width" no-caps color="primary" :loading="loading"
        label="Editer l'évènement" @click="submit" icon-right="check" data-cy="event-edition-button"
        :disable="historiesLoading" />
    </div>

    <ni-history-cancellation-modal v-model="historyCancellationModal" @hide="resetHistoryCancellationModal"
      @cancel-time-stamping="cancelTimeStamping" :start="isStartCancellation"
      :validations="v$.timeStampCancellationReason" v-model:reason="timeStampCancellationReason" />

    <ni-event-cancellation-modal v-model="eventCancellationModal" :edited-event="editedEvent"
      :customer-name="customerFullName" @update-event-misc="updateEvent('misc', $event)" :validations="v$.editedEvent"
      @update-cancellation-reason="updateEvent('cancel.reason', $event)" @cancel-event="cancelEvent"
      @hide="closeEventCancellationModal" @update-cancellation-condition="updateEvent('cancel.condition', $event)" />
  </q-dialog>
</template>

<script>
import get from 'lodash/get';
import set from 'lodash/set';
import { ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import EventHistories from '@api/EventHistories';
import Button from '@components/Button';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { INTERVENTION, ABSENCE, OTHER, NEVER, ABSENCE_TYPES, TIME_STAMPING_ACTIONS } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import moment from '@helpers/moment';
import { planningModalMixin } from 'src/modules/client/mixins/planningModalMixin';
import NiEventHistory from 'src/modules/client/components/planning/EventHistory';
import NiHistoryCancellationModal from './HistoryCancellationModal';
import NiEventCancellationModal from './EventCancellationModal';

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
    eventHistories: { type: Array, default: () => [] },
    historiesLoading: { type: Boolean, default: false },
  },
  setup () {
    const eventCancellationModal = ref(false);
    const v$ = useVuelidate();

    const openEventCancellationModal = () => { eventCancellationModal.value = true; };

    const closeEventCancellationModal = () => {
      eventCancellationModal.value = false;
      v$.value.editedEvent.$reset();
    };
    return {
      // Data
      eventCancellationModal,
      // Methods
      openEventCancellationModal,
      closeEventCancellationModal,
      set,
      // Validations
      v$,
    };
  },
  components: {
    'ni-button': Button,
    'ni-event-history': NiEventHistory,
    'ni-history-cancellation-modal': NiHistoryCancellationModal,
    'ni-event-cancellation-modal': NiEventCancellationModal,
  },
  emits: [
    'refresh-histories',
    'delete-event',
    'delete-event-repetition',
    'submit',
    'document-uploaded',
    'delete-document',
    'hide',
    'close',
    'update-event',
  ],
  data () {
    return {
      displayHistory: false,
      historyCancellationModal: false,
      historyToCancel: {},
      isStartCancellation: true,
      timeStampCancellationReason: '',
      ABSENCE_TYPES,
    };
  },
  validations () {
    return {
      timeStampCancellationReason: { required },
      editedEvent: { misc: { required }, cancel: { condition: { required }, reason: { required } } },
    };
  },
  computed: {
    historyButtonLabel () {
      return this.displayHistory ? 'Masquer les détails' : 'Afficher les détails';
    },
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
    eventTypeLabel () {
      return this.eventTypeOptions.find(option => option.value === this.editedEvent.type)?.label || '';
    },
    isBilledIntervention () {
      return this.editedEvent.type === INTERVENTION && this.editedEvent.isBilled;
    },
    canCancel () {
      return this.editedEvent.type === INTERVENTION &&
        !this.editedEvent.shouldUpdateRepetition &&
        !this.isBilledIntervention &&
        !this.startDateTimeStamped &&
        !this.endDateTimeStamped &&
        !this.isCustomerArchived;
    },
    auxiliaryFilterPlaceholder () {
      return this.selectedAuxiliary.identity
        ? formatIdentity(this.selectedAuxiliary.identity, 'FL')
        : 'À affecter';
    },
    isMiscRequired () {
      return (this.editedEvent.type === ABSENCE && this.editedEvent.absence === OTHER) || this.editedEvent.isCancelled;
    },
    extensionInfos () {
      const nature = ABSENCE_TYPES.find(abs => abs.value === this.editedEvent.absence);
      const startDate = moment(this.editedEvent.extension.startDate).format('DD/MM/YYYY');

      return `Cette absence est une prolongation de ${nature.label.toLowerCase()} commencant le ${startDate}.`;
    },
    customerStoppedDate () {
      return get(this.selectedCustomer, 'stoppedAt') || '';
    },
    customerFullName () {
      return `${get(this.selectedCustomer, 'identity.firstname')} ${get(this.selectedCustomer, 'identity.lastname')}` ||
        '';
    },
    startDateTimeStamped () {
      return this.eventHistories
        .some(h => TIME_STAMPING_ACTIONS.includes(h.action) && h.update.startHour && !h.isCancelled);
    },
    endDateTimeStamped () {
      return this.eventHistories
        .some(h => TIME_STAMPING_ACTIONS.includes(h.action) && h.update.endHour && !h.isCancelled);
    },
    isEventTimeStamped () {
      return !!this.startDateTimeStamped || !!this.endDateTimeStamped;
    },
    isCustomerArchived () {
      return !!get(this.selectedCustomer, 'archivedAt');
    },
    canUpdateIntervention () {
      return !this.isBilledIntervention && !this.isCustomerArchived;
    },
    canUpdateAuxiliary () {
      return this.canUpdateIntervention && !this.isEventTimeStamped;
    },
    isAbsenceEndDateDisabled () {
      return this.isHourlyAbsence(this.editedEvent) || this.isHalfDailyAbsence(this.editedEvent);
    },
    isAbsenceStartHourDisabled () {
      return this.isDailyAbsence(this.editedEvent) && !this.isIllnessOrWorkAccident(this.editedEvent);
    },
    auxiliariesOptions () {
      return this.getAuxiliariesOptions(this.editedEvent);
    },
  },
  methods: {
    toggleHistory () {
      this.displayHistory = !this.displayHistory;
    },
    updateEvent (path, value) {
      this.$emit('update-event', { path, value });
    },
    toggleRepetition () {
      this.updateEvent('cancel', {});
      this.updateEvent('isCancelled', false);
      this.updateEvent('shouldUpdateRepetition', !this.editedEvent.shouldUpdateRepetition);
    },
    isRepetition (event) {
      return ABSENCE !== event.type && event.repetition && event.repetition.frequency !== NEVER;
    },
    close () {
      this.$emit('close');
    },
    hide (partialReset, type) {
      this.displayHistory = false;
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
      if (addressIndex === 0) this.updateEvent('address', addressList[1].value);
      else this.updateEvent('address', addressList[0].value);
    },
    updateAbsence (event) {
      this.updateEvent('absence', event);
      this.setDateHours('editedEvent', this.editedEvent);
    },
    updateAddress (event) {
      this.updateEvent('address', event);
      this.deleteClassFocus();
    },
    openTimeStampCancellationModal (isStartCancellation) {
      this.isStartCancellation = isStartCancellation;
      this.historyToCancel = isStartCancellation
        ? this.eventHistories
          .find(h => TIME_STAMPING_ACTIONS.includes(h.action) && h.update.startHour && !h.isCancelled)
        : this.eventHistories.find(h => TIME_STAMPING_ACTIONS.includes(h.action) && h.update.endHour && !h.isCancelled);
      this.historyCancellationModal = true;
    },
    resetHistoryCancellationModal () {
      this.timeStampCancellationReason = '';
      this.historyCancellationModal = false;
      this.historyToCancel = {};
      this.v$.timeStampCancellationReason.$reset();
    },
    async refreshHistories (eventId) {
      await this.$emit('refresh-histories', eventId);
    },
    async cancelTimeStamping () {
      try {
        this.v$.timeStampCancellationReason.$touch();
        if (this.v$.timeStampCancellationReason.$error) return NotifyWarning('Champ(s) invalide(s)');

        await EventHistories.updateById(
          this.historyToCancel._id,
          { isCancelled: true, timeStampCancellationReason: this.timeStampCancellationReason }
        );

        await this.refreshHistories(this.editedEvent._id);

        this.resetHistoryCancellationModal();
        NotifyPositive('Horodatage annulé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'annulation de l\'horodatage.');
      }
    },
    cancelEvent () {
      this.updateEvent('isCancelled', true);
      this.updateEvent(
        'cancel',
        { reason: this.editedEvent.cancel.reason, condition: this.editedEvent.cancel.condition }
      );
      this.closeEventCancellationModal();
      this.$emit('submit');
    },
  },
};
</script>

<style lang="sass" scoped>
.modal-subtitle
  display: flex
  justify-content: space-between
  margin-bottom: 16px

.light-checkbox
  color: $copper-grey-400
  font-size: 14px

.infos
  font-style: italic
  color: $copper-grey-400
</style>
