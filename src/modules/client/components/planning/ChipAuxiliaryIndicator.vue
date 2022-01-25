<template>
  <div class="person-inner-cell">
    <div :class="[!staffingView && 'q-mb-sm']">
      <div class="chip-container" @click="openIndicatorsModal">
        <img :src="getAvatar(person.picture)" class="avatar">
        <q-chip v-if="hasContractOnEvent" :class="[`${occupationLevel}-occupation`]" small>
          <q-spinner-dots v-if="loading" />
          <span v-else class="chip-indicator">
            {{ Math.round(workingStats.workedHours) }}h / {{ Math.round(workingStats.hoursToWork) }}
          </span>
        </q-chip>
      </div>
    </div>
    <div class="person-name overflow-hidden-nowrap">{{ formatIdentity(person.identity, 'Fl') }}</div>

    <!-- Indicators modal -->
    <q-dialog v-model="indicatorsModal">
      <div class="modal-container modal-container-md">
        <div class="q-mb-md">
          <div class="row justify-between items-center q-pa-lg">
            <div class="col-11 person-name modal">
              <img :src="getAvatar(person.picture)" class="avatar">
              <div class="q-pl-md">{{ person.identity.firstname }} {{ person.identity.lastname.toUpperCase() }}</div>
            </div>
            <div class="col-1 cursor-pointer modal-btn-close">
              <span>
                <q-icon name="close" v-close-popup size="sm" />
              </span>
            </div>
          </div>
          <q-tabs active-color="primary" align="justify" dense v-model="selectedTab">
            <q-tab class="col-6" v-for="(tab, index) in tabsContent" :key="index" :label="tab.label" :name="tab.name" />
          </q-tabs>
          <q-tab-panels v-model="selectedTab" animated>
            <q-tab-panel v-for="(tab, index) in tabsContent" :key="index" :name="tab.name" class="q-mt-lg">
              <ni-auxiliary-indicators :hours-details="hoursDetails" :customers-details="customersDetails" />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script>
import get from 'lodash/get';
import Pay from '@api/Pay';
import Stats from '@api/Stats';
import {
  DEFAULT_AVATAR,
  PREV_MONTH_STATS,
  MONTH_STATS,
  LOW,
  EXTREME,
  MAX_WEEKLY_OCCUPATION_LEVEL,
  HIGH,
} from '@data/constants';
import moment from '@helpers/moment';
import { upperCaseFirstLetter, formatIdentity } from '@helpers/utils';
import AuxiliaryIndicators from 'src/modules/client/components/planning/AuxiliaryIndicators';

export default {
  name: 'ChipAuxiliaryIndicator',
  components: {
    'ni-auxiliary-indicators': AuxiliaryIndicators,
  },
  props: {
    person: { type: Object, default: () => ({ picture: { link: '' }, administrative: {}, contracts: [] }) },
    events: { type: Array, default: () => [] },
    startOfWeek: { type: String, default: '' },
    workingStats: { type: Object, default: () => ({ workedHours: 0, hoursToWork: 0 }) },
    staffingView: { type: Boolean, default: false },
  },
  data () {
    return {
      loading: false,
      indicatorsModal: false,
      selectedTab: MONTH_STATS,
      monthHoursDetails: {},
      prevMonthHoursDetails: {},
      monthCustomersDetails: {},
      prevMonthCustomersDetails: {},
    };
  },
  computed: {
    tabsContent () {
      const currentMonthLabel = moment(this.startOfWeek).startOf('month').format('MMMM YY');
      const prevMonthLabel = moment(this.startOfWeek).subtract(1, 'month').startOf('month').format('MMMM YY');
      return [
        { label: upperCaseFirstLetter(currentMonthLabel), default: true, name: MONTH_STATS },
        { label: upperCaseFirstLetter(prevMonthLabel), default: false, name: PREV_MONTH_STATS },
      ];
    },
    occupationLevel () {
      if (this.workingStats.hoursToWork !== 0 && this.workingStats.workedHours < this.workingStats.hoursToWork) {
        return LOW;
      } if (this.workingStats.workedHours < MAX_WEEKLY_OCCUPATION_LEVEL) {
        return HIGH;
      }
      return EXTREME;
    },
    hoursDetails () {
      return this.selectedTab === MONTH_STATS ? this.monthHoursDetails : this.prevMonthHoursDetails;
    },
    customersDetails () {
      return this.selectedTab === MONTH_STATS ? this.monthCustomersDetails : this.prevMonthCustomersDetails;
    },
    endOfWeek () {
      return moment(this.startOfWeek).endOf('w').toISOString();
    },
    hasContractOnEvent () {
      if (!this.person.contracts || this.person.contracts.length === 0) return false;

      return this.person.contracts.some(contract => (moment(contract.startDate).isSameOrBefore(this.endOfWeek) &&
          (!contract.endDate || moment(contract.endDate).isAfter(this.endOfWeek))) ||
          (moment(contract.startDate).isSameOrBefore(this.startOfWeek) &&
          (!contract.endDate || moment(contract.endDate).isAfter(this.startOfWeek))));
    },
  },
  methods: {
    formatIdentity,
    getAvatar (picture) {
      return (get(picture, 'link')) || DEFAULT_AVATAR;
    },
    async openIndicatorsModal () {
      if (!this.hasContractOnEvent) return;
      await Promise.all([this.getMonthDetails(), this.getPrevMonthDetails()]);

      this.indicatorsModal = true;
    },
    async getMonthDetails () {
      const month = moment(this.startOfWeek).format('MM-YYYY');
      try {
        this.monthHoursDetails = await Pay.getHoursBalanceDetail({ auxiliary: this.person._id, month });
        const monthCustomersDetails = await Stats.getPaidInterventionStats({ auxiliary: this.person._id, month });
        [this.monthCustomersDetails] = monthCustomersDetails;
      } catch (e) {
        console.error(e);
        this.monthHoursDetails = {};
      }
    },
    async getPrevMonthDetails () {
      const month = moment(this.startOfWeek).subtract(1, 'M').format('MM-YYYY');
      try {
        this.prevMonthHoursDetails = await Pay.getHoursBalanceDetail({ auxiliary: this.person._id, month });
        const prevMonthCustomersDetails = await Stats.getPaidInterventionStats({ auxiliary: this.person._id, month });
        [this.prevMonthCustomersDetails] = prevMonthCustomersDetails;
      } catch (e) {
        console.error(e);
        this.prevMonthHoursDetails = {};
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.q-chip
  cursor: pointer
.q-tab-panel
  padding: 0
.q-tabs
  margin: 0px 24px
.q-tab
  text-transform: none
  padding: 3px 0
  display: flex
  justify-content: flex-start
:deep(.q-hoverable:hover > .q-focus-helper)
  background: none !important
:deep(.q-ripple)
  display: none

.person-name.modal
  font-size: 14px !important
</style>
