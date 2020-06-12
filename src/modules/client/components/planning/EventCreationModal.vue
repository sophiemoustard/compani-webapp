<template>
  <q-dialog v-if="Object.keys(newEvent).length !== 0" :value="creationModal" @hide="resetForm(false)">
    <div class="modal-container-md">
      <div class="modal-padding">
        <ni-planning-modal-header v-if="isCustomerPlanning" v-model="newEvent.customer"
          :selectedPerson="selectedCustomer" @close="close" />
        <ni-planning-modal-header v-else v-model="newEvent.auxiliary" :options="auxiliariesOptions"
          :selectedPerson="selectedAuxiliary" @close="close" @update:sector="updateSectorEvent" />
        <div class="modal-subtitle">
          <q-btn-toggle no-wrap v-model="newEvent.type" unelevated toggle-color="primary" :options="eventTypeOptions"
            @input="resetForm(true, newEvent.type)" text-color="black" />
        </div>
        <template v-if="newEvent.type !== ABSENCE">
          <ni-datetime-range caption="Dates et heures de l'évènement" v-model="newEvent.dates" required-field
            :error="validations.dates.$error" @blur="validations.dates.$touch" disable-end-date />
        </template>
        <template v-if="newEvent.type === INTERVENTION">
          <ni-select v-if="isCustomerPlanning" in-modal caption="Auxiliaire" v-model="newEvent.auxiliary"
            :options="auxiliariesOptions" :error="validations.auxiliary.$error" required-field
            @blur="validations.auxiliary.$touch" />
          <ni-select v-else in-modal caption="Bénéficiaire" v-model="newEvent.customer" :options="customersOptions"
            :error="validations.customer.$error" required-field @blur="validations.customer.$touch"
            @input="setEventAddressAndSubscription" data-cy="event-creation-customer" />
          <ni-select in-modal caption="Service" v-model="newEvent.subscription" :error="validations.subscription.$error"
            :options="customerSubscriptionsOptions" required-field @blur="validations.subscription.$touch"
            data-cy="event-creation-service" />
        </template>
        <template v-if="newEvent.type === ABSENCE">
          <ni-select in-modal caption="Nature" v-model="newEvent.absenceNature" :options="absenceNatureOptions"
            :error="validations.absenceNature.$error" required-field @blur="validations.absenceNature.$touch"
            @input="resetAbsenceType" />
          <ni-select in-modal caption="Type d'absence" v-model="newEvent.absence" :options="absenceOptions"
            :error="validations.absence.$error" required-field @blur="validations.absence.$touch"
            :disable="isHourlyAbsence(newEvent)" @input="setDateHours(newEvent, 'newEvent')" />
          <ni-datetime-range caption="Dates et heures de l'évènement" v-model="newEvent.dates" required-field
            :disable-end-date="isHourlyAbsence(newEvent)" :error="validations.dates.$error"
            @blur="validations.dates.$touch" :disable-end-hour="isDailyAbsence(newEvent)"
            :disable-start-hour="!isIllnessOrWorkAccident(newEvent) && !isHourlyAbsence(newEvent)" />
          <ni-file-uploader v-if="isIllnessOrWorkAccident(newEvent)" caption="Justificatif d'absence" path="attachment"
            :entity="newEvent" alt="justificatif absence" name="file" :url="docsUploadUrl" @uploaded="documentUploaded"
            :additionalValue="additionalValue" required-field in-modal
            :error="validations.attachment.link.$error || validations.attachment.driveId.$error"
            @delete="deleteDocument(newEvent.attachment.driveId)" :disable="!selectedAuxiliary._id" />
        </template>
        <template v-if="newEvent.type === INTERNAL_HOUR">
          <ni-select in-modal caption="Type d'heure interne" v-model="newEvent.internalHour"
            :options="internalHourOptions" required-field :error="validations.internalHour.$error"
            @blur="validations.internalHour.$touch" />
        </template>
        <template v-if="newEvent.type !== ABSENCE && newEvent.repetition">
          <ni-select in-modal caption="Répétition de l'évènement" v-model="newEvent.repetition.frequency"
            :options="repetitionOptions" required-field @blur="validations.repetition.frequency.$touch"
            :disable="!isRepetitionAllowed" />
        </template>
        <template v-if="newEvent.type === INTERNAL_HOUR">
          <ni-search-address v-model="newEvent.address" :error-label="addressError" @blur="validations.address.$touch"
            :error="validations.address.$error" inModal />
        </template>
        <ni-input in-modal v-model="newEvent.misc" caption="Notes" @blur="validations.misc.$touch"
          :error="validations.misc.$error" :required-field="newEvent.type === ABSENCE && newEvent.absence === OTHER" />
      </div>
      <div v-if="newEvent.type === INTERVENTION && customerAddressList(newEvent).length > 0" class="customer-info">
        <div class="row items-center no-wrap">
          <q-select borderless dense v-model="newEvent.address" @input="deleteClassFocus" emit-value behavior="menu"
            :options="customerAddressList(newEvent)" :readonly="customerAddressList(newEvent).length === 1"
            :display-value="newEvent.address.fullAddress" ref="addressSelect">
            <template v-slot:append v-if="customerAddressList(newEvent).length > 1">
              <q-icon name="swap_vert" class="select-icon pink-icon cursor-pointer" @click.stop="toggleAddressSelect" />
            </template>
          </q-select>
        </div>
      </div>
      <q-btn class="full-width modal-btn" no-caps :loading="loading" label="Créer l'évènement" color="primary"
        @click="createEvent" icon-right="add" data-cy="event-creation-button" />
    </div>
  </q-dialog>
</template>

<script>
import get from 'lodash/get';
import {
  ABSENCE,
  INTERNAL_HOUR,
  HOURLY,
  UNJUSTIFIED,
  CUSTOMER_CONTRACT,
  COMPANY_CONTRACT,
  INTERVENTION,
  NEVER,
} from '@data/constants';
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
  computed: {
    isEndDurationRequired () {
      if (this.newEvent.type !== ABSENCE) return false;

      return this.$moment(this.newEvent.dates.endDate).isAfter(this.$moment(this.newEvent.dates.startDate));
    },
    isCompanyContractValidForRepetition () {
      if (!this.selectedAuxiliary.contracts || this.selectedAuxiliary.contracts.length === 0) return false;
      if (!this.selectedAuxiliary.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;
      const companyContracts = this.selectedAuxiliary.contracts.filter(contract => contract.status === COMPANY_CONTRACT);
      if (!companyContracts || companyContracts.length === 0) return false;

      return companyContracts.some(contract => !contract.endDate);
    },
    isCustomerContractValidForRepetition () {
      if (!this.selectedAuxiliary.contracts || this.selectedAuxiliary.contracts.length === 0) return false;
      if (!this.selectedAuxiliary.contracts.some(contract => contract.status === CUSTOMER_CONTRACT)) return false;
      const correspContracts = this.selectedAuxiliary.contracts.find(ctr => ctr.customer === this.newEvent.customer);
      if (!correspContracts) return false;

      return correspContracts.some(contract => !contract.endDate);
    },
    isRepetitionAllowed () {
      if (!this.newEvent.auxiliary) return true;
      if (this.newEvent.subscription !== '' && this.newEvent.customer !== '' && this.newEvent.auxiliary !== '') {
        if (!this.selectedCustomer.subscriptions) return true;

        const selectedSubscription = this.selectedCustomer.subscriptions.find(sub => sub._id === this.newEvent.subscription);
        if (!selectedSubscription) return true;
        if (get(selectedSubscription, 'service.type') === COMPANY_CONTRACT) return this.isCompanyContractValidForRepetition;
        if (get(selectedSubscription, 'service.type') === CUSTOMER_CONTRACT) return this.isCustomerContractValidForRepetition;
      }

      return true;
    },
    selectedCustomer () {
      if (!this.newEvent.customer) return { identity: {} };
      return this.customers.find(customer => customer._id === this.newEvent.customer);
    },
    selectedAuxiliary () {
      if (!this.newEvent.auxiliary || !this.activeAuxiliaries.length) return { identity: {} };
      const aux = this.activeAuxiliaries.find(aux => aux._id === this.newEvent.auxiliary);
      const hasCustomerContractOnEvent = this.hasCustomerContractOnEvent(aux, this.newEvent.dates.startDate);
      const hasCompanyContractOnEvent = this.hasCompanyContractOnEvent(aux, this.newEvent.dates.startDate);

      return { ...aux, hasCustomerContractOnEvent, hasCompanyContractOnEvent };
    },
  },
  watch: {
    selectedAuxiliary (value) {
      if (!this.selectedAuxiliary.hasCompanyContractOnEvent && this.newEvent.type === INTERNAL_HOUR) {
        this.$emit('update:newEvent', { ...this.newEvent, type: INTERVENTION });
      }
    },
    isRepetitionAllowed (value) {
      if (!value) {
        this.$emit('update:newEvent', {
          ...this.newEvent,
          repetition: { ...this.newEvent.repetition, frequency: NEVER },
        });
      }
    },
  },
  methods: {
    close () {
      this.$emit('close');
    },
    resetForm (partialReset, type) {
      this.$emit('resetForm', { partialReset, type });
    },
    deleteDocument (value) {
      this.$emit('deleteDocument', value);
    },
    documentUploaded (value) {
      this.$emit('documentUploaded', value);
    },
    createEvent (value) {
      this.$emit('createEvent', value);
    },
    resetAbsenceType () {
      if (this.newEvent.type === ABSENCE && this.newEvent.absenceNature === HOURLY) {
        this.$emit('update:newEvent', { ...this.newEvent, absence: UNJUSTIFIED });
      }
    },
    updateSectorEvent (auxId) {
      const auxiliary = this.activeAuxiliaries.find(aux => aux._id === auxId);
      this.$emit('update:newEvent', { ...this.newEvent, sector: auxiliary ? auxiliary.sector._id : '' });
    },
    setEventAddressAndSubscription () {
      const payload = {
        ...this.newEvent,
        address: get(this.selectedCustomer, 'contact.primaryAddress', {}),
      };
      if (this.customerSubscriptionsOptions.length === 1) {
        payload.subscription = this.customerSubscriptionsOptions[0].value;
      }
      this.$emit('update:newEvent', payload);
    },
  },
}
</script>

<style lang="stylus" scoped>
  /deep/ .q-btn-toggle
    width: 100%
    @media screen and (max-width: 767px)
      display: inline-flex;
      flex-wrap: wrap;
    & .q-btn-item
      width: 24%;
      border-radius: 20px;
      margin: 5px;
      background-color: $middle-grey;
      @media screen and (max-width: 767px)
        width: 45%;

</style>
