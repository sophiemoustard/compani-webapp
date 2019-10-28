<template>
  <div class="chip-container" @click="openIndicatorsModal">
    <img :src="getAvatar(person.picture)" class="avatar">
    <q-chip v-if="hasCompanyContractOnEvent" :class="[`${occupationLevel}-occupation`]" small text-color="white">
      <q-spinner-dots v-if="loading" />
      <span v-else class="chip-indicator">{{ ratio.weeklyHours }}h / {{ ratio.contractHours }}</span>
    </q-chip>

    <!-- Indicators modal -->
    <q-dialog :value="indicatorsModal">
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
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel v-for="(tab, index) in tabsContent" :key="index" :name="tab.name">
              <ni-auxiliary-indicators :total-working-hours="totalWorkingHours" :weekly-interventions="weeklyInterventions"
                :weekly-internal-hours="weeklyInternalHours" :weekly-paid-transports="weeklyPaidTransports"
                :customers-count="customersCount" :average-time-by-customer="averageTimeByCustomer"
                :weekly-break="weeklyBreak" :time-unit="tab.name" />
            </q-tab-panel>
          </q-tab-panels>
        </div>
      </div>
    </q-dialog>
  </div>
</template>

<script>
import AuxiliaryIndicators from './AuxiliaryIndicators';
import {
  DEFAULT_AVATAR,
  ABSENCE,
  INTERVENTION,
  INTERNAL_HOUR,
  TRANSIT,
  DRIVING,
  PUBLIC_TRANSPORT,
  WEEK_STATS,
  MONTH_STATS,
  COMPANY_CONTRACT,
  DAILY,
  FIXED,
  LOW,
  EXTREME,
  MAX_WEEKLY_OCCUPATION_LEVEL,
  HIGH,
} from '../../data/constants.js';
import googleMaps from '../../api/GoogleMaps';
import { getPaidTransport } from '../../helpers/planning';

export default {
  name: 'ChipAuxiliaryIndicator',
  components: {
    'ni-auxiliary-indicators': AuxiliaryIndicators,
  },
  props: {
    person: { type: Object, default: () => ({ picture: { link: '' }, administrative: {}, contracts: [] }) },
    events: { type: Array, default: () => [] },
    startOfWeek: { type: String, default: '' },
    dm: { type: Array, default: () => [] },
  },
  data () {
    return {
      loading: false,
      ratio: { weeklyHours: 0, contractHours: 0 },
      indicatorsModal: false,
      tabsContent: [
        { label: 'Stats de la semaine', default: true, name: WEEK_STATS },
        { label: 'Stats du mois', default: false, name: MONTH_STATS },
      ],
      breakInfo: [],
      weeklyInternalHours: 0,
      weeklyInterventions: 0,
      weeklyPaidTransports: 0,
      weeklyBreak: 0,
      customersCount: 0,
      averageTimeByCustomer: 0,
      selectedTab: WEEK_STATS,
      monthEvents: [],
      distanceMatrix: [],
      tab: WEEK_STATS,
    };
  },
  computed: {
    occupationLevel () {
      if (this.ratio.contractHours !== 0 && this.ratio.weeklyHours < this.ratio.contractHours) {
        return LOW;
      } else if (this.ratio.weeklyHours < MAX_WEEKLY_OCCUPATION_LEVEL) {
        return HIGH;
      }
      return EXTREME;
    },
    endOfWeek () {
      return this.$moment(this.startOfWeek).endOf('w').toISOString();
    },
    days () {
      let range;
      if (this.selectedTab === WEEK_STATS) range = this.$moment.range(this.startOfWeek, this.endOfWeek);
      else {
        const start = this.$moment(this.startOfWeek).startOf('month');
        const end = this.$moment(this.startOfWeek).endOf('month');
        range = this.$moment.range(start, end);
      }

      return Array.from(range.by('days'));
    },
    totalWorkingHours () {
      return this.weeklyInternalHours + this.weeklyInterventions + this.weeklyPaidTransports;
    },
    transportMode () {
      return this.person.administrative.transportInvoice.transportType === PUBLIC_TRANSPORT ? TRANSIT : DRIVING;
    },
    selectedEvents () {
      const events = this.selectedTab === WEEK_STATS ? this.events : this.monthEvents;

      return events.map(ev => ({
        ...ev,
        hasFixedService: ev.type === INTERVENTION && this.$_.get(ev, 'subscription.service.nature') === FIXED,
      }));
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
  async mounted () {
    if (!this.hasCompanyContractOnEvent) return;
    await this.getRatio();
    this.distanceMatrix = this.$_.cloneDeep(this.dm);
  },
  watch: {
    async selectedEvents () {
      if (!this.hasCompanyContractOnEvent) return;
      await this.computeIndicators();
    },
    async events () {
      if (!this.hasCompanyContractOnEvent) return;
      this.selectedTab = WEEK_STATS;
      await this.getRatio();
    },
  },
  methods: {
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
    async computeIndicators () {
      await this.computeBreakInfo();
      this.computeIndicatorsFromBreakInfo();
      this.computeIndicatorsFromEvents();
    },
    async getRatio () {
      try {
        this.loading = true;
        this.ratio = { weeklyHours: 0, contractHours: 0 };
        await this.computeIndicators();
        this.ratio = { weeklyHours: Math.round(this.totalWorkingHours), contractHours: this.getContractHours() };
      } catch (e) {
        this.ratio = { weeklyHours: 0, contractHours: 0 };
      } finally {
        this.loading = false;
      }
    },
    async openIndicatorsModal () {
      if (!this.hasCompanyContractOnEvent) return;
      try {
        this.monthEvents = await this.$events.list({
          startDate: this.$moment(this.startOfWeek).startOf('month').toDate(),
          endDate: this.$moment(this.startOfWeek).endOf('month').toDate(),
          auxiliary: this.person._id,
        });
      } catch (e) {
        this.monthEvents = [];
      } finally {
        this.indicatorsModal = true;
      }
    },
    // Compute indicators
    computeIndicatorsFromBreakInfo () {
      let weeklyPaidTransports = 0;
      let weeklyBreak = 0;
      for (const info of this.breakInfo) {
        if (info.timeBetween) weeklyBreak += info.timeBetween;
        if (info.transportDuration > 0) weeklyPaidTransports += getPaidTransport(info.transportDuration, info.timeBetween);
      };

      this.weeklyBreak = weeklyBreak / 60;
      this.weeklyPaidTransports = weeklyPaidTransports / 60;
    },
    computeIndicatorsFromEvents () {
      let weeklyInternalHours = 0;
      let weeklyInterventions = 0;
      let hoursByCustomer = {}
      for (const event of this.selectedEvents) {
        if (event.hasFixedService) continue;

        const interventionTime = this.$moment(event.endDate).diff(event.startDate, 'm', true);
        if (event.type === INTERNAL_HOUR) weeklyInternalHours += interventionTime;
        if (event.type === INTERVENTION) {
          if (!Object.keys(hoursByCustomer).includes(event.customer._id)) hoursByCustomer[event.customer._id] = 0;
          hoursByCustomer[event.customer._id] += interventionTime;
          weeklyInterventions += interventionTime;
        }
      };

      this.weeklyInternalHours = weeklyInternalHours / 60;
      this.weeklyInterventions = weeklyInterventions / 60;
      this.customersCount = Object.keys(hoursByCustomer).length;
      this.averageTimeByCustomer = this.customersCount === 0 ? 0
        : Object.values(hoursByCustomer).reduce((acc, hours) => acc + hours, 0) / 60 / this.customersCount;
    },
    async computeBreakInfo () {
      const breakInfo = [];
      for (const day of this.days) {
        const eventsOnDay = this.getEventsOnDay(day);
        if (eventsOnDay.length <= 1) continue;

        for (let i = 0; i < eventsOnDay.length - 1; i++) {
          if (eventsOnDay[i].hasFixedService || eventsOnDay[i + 1].hasFixedService) continue;

          const transportInfo = await this.getBreakInfoBetweenTwoEvents(eventsOnDay[i], eventsOnDay[i + 1]);
          if (transportInfo) breakInfo.push(transportInfo);
        }
      }

      this.breakInfo = breakInfo;
    },
    getEventAddress (event) {
      return event.address && (event.type === INTERVENTION || event.type === INTERNAL_HOUR) ? event.address.fullAddress : null;
    },
    async getTransportDuration (origins, destinations) {
      let distanceMatrix = this.distanceMatrix
        .find(dm => dm.origins === origins && dm.destinations === destinations && dm.mode === this.transportMode);
      if (!distanceMatrix) {
        const params = { origins, destinations, mode: this.transportMode };
        distanceMatrix = await googleMaps.getDistanceMatrix(params);
        this.distanceMatrix.push({
          ...params,
          duration: distanceMatrix ? distanceMatrix.duration : 0,
          distance: distanceMatrix ? distanceMatrix.distance : 0,
        });
      }

      return distanceMatrix && distanceMatrix.duration ? Math.round(distanceMatrix.duration / 60) : 0;
    },
    getEventsOnDay (day) {
      return this.selectedEvents
        .filter(event => day.isSameOrAfter(event.startDate, 'd') && day.isSameOrBefore(event.endDate, 'd') &&
          [INTERVENTION, INTERNAL_HOUR].includes(event.type))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    async getBreakInfoBetweenTwoEvents (eventOrigin, eventDestination) {
      const timeBetween = this.$moment(eventDestination.startDate).diff(this.$moment(eventOrigin.endDate), 'minutes');
      const breakInfo = {
        origin: eventOrigin._id,
        destination: eventDestination._id,
        timeBetween,
      }

      const origins = this.getEventAddress(eventOrigin);
      const destinations = this.getEventAddress(eventDestination);
      if (!origins || !destinations) {
        return { ...breakInfo, transportDuration: 0 };
      }

      const transportDuration = await this.getTransportDuration(origins, destinations);

      return { ...breakInfo, transportDuration };
    },
    // Compute contract hours
    getCurrentContract (contracts, day) {
      if (!contracts || contracts.length === 0) return [];
      return contracts.find(contract =>
        this.$moment(contract.startDate).isSameOrBefore(day) &&
        (!contract.endDate || this.$moment(contract.endDate).isAfter(day))
      );
    },
    getContractVersionOnDay (day) {
      if (!this.companyContracts || this.companyContracts.length === 0) return null;

      const currentContract = this.getCurrentContract(this.companyContracts, day);
      if (!currentContract) return null;

      return this.getCurrentContract(currentContract.versions, day);
    },
    getContractHours () {
      let contractHours = 0;
      const contractDaysRange = Array.from(this.$moment.range(this.startOfWeek, this.$moment(this.endOfWeek).subtract(1, 'd')).by('days')) // from Monday to Saturday
      for (const day of contractDaysRange) {
        const absences = this.events.filter(event =>
          event.type === ABSENCE &&
          day.isSameOrAfter(event.startDate, 'd') && day.isSameOrBefore(event.endDate, 'd')
        );
        const dailyAbsence = absences.find(abs => abs.absenceNature === DAILY);
        if (dailyAbsence) continue;

        const hourlyAbsence = absences.length === 0 ? 0 : absences.reduce(
          (total, abs) => total + (this.$moment(abs.endDate).diff(abs.startDate, 'm') / 60),
          0
        );

        const version = this.getContractVersionOnDay(day);
        if (!version) continue;

        contractHours += version.weeklyHours / 6 || 0; // 6 : from Monday to Saturday, there are 6 half days
        contractHours -= hourlyAbsence;
      };
      return Math.round(contractHours);
    },
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
