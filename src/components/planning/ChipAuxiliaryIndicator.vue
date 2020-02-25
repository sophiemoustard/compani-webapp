<template>
  <div class="person-inner-cell">
    <div :class="[!staffingView && 'q-mb-sm']">
      <div class="chip-container" @click="openIndicatorsModal">
        <img :src="getAvatar(person.picture)" class="avatar">
        <q-chip v-if="hasCompanyContractOnEvent" :class="[`${occupationLevel}-occupation`]" small text-color="white">
          <q-spinner-dots v-if="loading" />
          <span v-else class="chip-indicator">
            {{ Math.round(workingStats.workedHours) }}h / {{ Math.round(workingStats.hoursToWork) }}
          </span>
        </q-chip>
      </div>
    </div>
    <div class="person-name overflow-hidden-nowrap">{{ person.identity | formatIdentity('Fl') }}</div>

    <!-- Indicators modal -->
    <q-dialog v-model="indicatorsModal">
      <div class="modal-container modal-container-md">
        <div class="q-mb-md">
          <div class="row justify-between items-center q-pa-lg">
            <div class="col-11 row person-name">
              <img :src="getAvatar(person.picture)" class="avatar">
              <div class="q-pl-md">{{ person.identity.firstname }} {{ person.identity.lastname.toUpperCase() }}</div>
            </div>
            <div class="col-1 cursor-pointer modal-btn-close">
              <span>
                <q-icon name="clear" v-close-popup />
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
import Pay from '../../api/Pay';
import Stats from '../../api/Stats';
import AuxiliaryIndicators from './AuxiliaryIndicators';
import {
  DEFAULT_AVATAR,
  PREV_MONTH_STATS,
  MONTH_STATS,
  LOW,
  EXTREME,
  COMPANY_CONTRACT,
  MAX_WEEKLY_OCCUPATION_LEVEL,
  HIGH,
} from '../../data/constants.js';
import { upperCaseFirstLetter, formatIdentity } from '../../helpers/utils';

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
      const currentMonthLabel = this.$moment(this.startOfWeek).startOf('month').format('MMMM YY');
      const prevMonthLabel = this.$moment(this.startOfWeek).subtract(1, 'month').startOf('month').format('MMMM YY');
      return [
        { label: upperCaseFirstLetter(currentMonthLabel), default: true, name: MONTH_STATS },
        { label: upperCaseFirstLetter(prevMonthLabel), default: false, name: PREV_MONTH_STATS },
      ];
    },
    occupationLevel () {
      if (this.workingStats.hoursToWork !== 0 && this.workingStats.workedHours < this.workingStats.hoursToWork) {
        return LOW;
      } else if (this.workingStats.workedHours < MAX_WEEKLY_OCCUPATION_LEVEL) {
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
      return this.$moment(this.startOfWeek).endOf('w').toISOString();
    },
    hasCompanyContractOnEvent () {
      if (!this.person.contracts || this.person.contracts.length === 0) return false;
      if (!this.person.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;
      const companyContracts = this.person.contracts.filter(contract => contract.status === COMPANY_CONTRACT);

      return companyContracts.some(contract => {
        return (this.$moment(contract.startDate).isSameOrBefore(this.endOfWeek) &&
          (!contract.endDate || this.$moment(contract.endDate).isAfter(this.endOfWeek))) ||
          (this.$moment(contract.startDate).isSameOrBefore(this.startOfWeek) &&
          (!contract.endDate || this.$moment(contract.endDate).isAfter(this.startOfWeek)));
      });
    },
    companyContracts () {
      return this.person.contracts ? this.person.contracts.filter(contract => contract.status === COMPANY_CONTRACT) : [];
    },
  },
  methods: {
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
    async openIndicatorsModal () {
      if (!this.hasCompanyContractOnEvent) return;
      await Promise.all([this.getMonthDetails(), this.getPrevMonthDetails()]);

      this.indicatorsModal = true;
    },
    async getMonthDetails () {
      const month = this.$moment(this.startOfWeek).format('MM-YYYY');
      try {
        this.monthHoursDetails = await Pay.getHoursBalanceDetail({ auxiliary: this.person._id, month });
        const monthCustomersDetails = await this.$stats.getPaidInterventionStats({ auxiliary: this.person._id, month });
        this.monthCustomersDetails = monthCustomersDetails[0];
      } catch (e) {
        console.error(e);
        this.monthHoursDetails = {};
      }
    },
    async getPrevMonthDetails () {
      const month = this.$moment(this.startOfWeek).subtract(1, 'M').format('MM-YYYY');
      try {
        this.prevMonthHoursDetails = await Pay.getHoursBalanceDetail({ auxiliary: this.person._id, month })
        const prevMonthCustomersDetails = await Stats.getPaidInterventionStats({ auxiliary: this.person._id, month });
        this.prevMonthCustomersDetails = prevMonthCustomersDetails[0];
      } catch (e) {
        console.error(e);
        this.prevMonthHoursDetails = {};
      }
    },
  },
  filters: {
    formatIdentity,
  },
}
</script>

<style lang="stylus" scoped>
  .highlight
    cursor: pointer;
  .highlight:hover
    .avatar
    .q-chip
      box-shadow: 0 0 1px 1px $primary-dark
  .q-chip
    cursor: pointer
  .q-tab-panel
    padding: 0;
  .q-tabs
    margin: 0px 24px;
  .q-tab
    text-transform: none
    padding: 3px 0
    display: flex
    justify-content: flex-start
  /deep/ .q-hoverable:hover > .q-focus-helper
    background: none !important
  /deep/ .q-ripple
    display: none

</style>
