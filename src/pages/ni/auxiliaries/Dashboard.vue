<template>
  <q-page class="neutral-background">
    <div class="title-padding row items-start">
      <div class="col-xs-12 col-md-5 row q-mb-md">
        <ni-chips-autocomplete ref="teamAutocomplete" v-model="terms" :filters="filters" />
      </div>
      <div class="col-xs-12 col-md-7 row justify-end">
        <div @click.native="monthModal = !monthModal" class="month-select">
          <span>{{ monthLabel }}</span>
          <q-icon name="arrow_drop_down" />
          <q-menu v-model="monthModal" anchor="bottom right" self="top right">
            <q-list dense padding>
              <q-item v-for="(month, index) in monthsOptions" :key="index" clickable @click="selectMonth(month.value)">
                <q-item-section>{{ month.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </div>
      </div>
    </div>
    <q-card v-for="sector of filteredSectors" :key="sector" class="sector-card row">
      <div class="col-md-6 col-xs-12 q-pl-md q-pr-md q-pt-md">
        <div class="q-mb-lg stats-header">
          <div class="text-capitalize">
            <div class="sector-name text-weight-bold">{{ sectorName(sector) }}</div>
            <div class="month-label">{{ monthLabel }}</div>
          </div>
          <q-circular-progress :value="Math.min(hoursRatio(sector), 100)" size="60px" track-color="grey-5"
            color="primary" show-value :thickness="0.3" class="text-weight-bold">
            {{ roundFrenchPercentage(Math.round(hoursRatio(sector)) / 100, 0).replace('&nbsp;', '') }}
          </q-circular-progress>
        </div>
        <div class="q-mb-md">
          <div class="row auxiliary">
            <div class="col-8 auxiliary-label">Heures facturées</div>
            <div class="col-4 auxiliary-value">{{ formatHours(getBilledHours(sector), 0) }}</div>
          </div>
          <div class="row auxiliary">
            <div class="col-8 auxiliary-label">Heures à travailler</div>
            <div class="col-4 auxiliary-value">{{ formatHours(getHoursToWork(sector), 0) }}</div>
          </div>
        </div>
        <div class="q-mb-md q-pt-md gauge-wrapper">
          <div>
            <ni-gauge :min="5" :max="20" :value="getInternalHoursRatio(sector)" />
          </div>
          <div>
            <ni-gauge :min="7" :max="16" :value="getPaidTransportStats(sector)" />
            {{ getPaidTransportStats(sector) }}%
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xs-12 customer">
        <template v-if="getCustomersAndDurationBySector(sector).customerCount !== 0">
          <div class="row">
            <div class="col-4 customer-value">{{ getCustomersAndDurationBySector(sector).customerCount }}</div>
            <div class="col-4 customer-value">
              {{ Math.round(getCustomersAndDurationBySector(sector).averageDuration) }}
            </div>
            <div class="col-4 customer-value">
              {{ Math.round(getCustomersAndDurationBySector(sector).auxiliaryTurnOver) }}
            </div>
          </div>
          <div class="row">
            <div class="col-4 customer-label">Bénéficiaires</div>
            <div class="col-4 customer-label">Heures par bénéficiaire</div>
            <div class="col-4 customer-label">Auxiliaires par bénéficiaires</div>
          </div>
        </template>
      </div>
      <div class="col-md-12 col-xs-12">
        <q-card-actions align="right">
          <template>
            <q-btn flat no-caps color="primary" :icon="getIcon(sector)" label="Voir le détail par auxiliaire"
              @click="openAuxiliariesDetails(sector)" />
          </template>
        </q-card-actions>
      </div>
      <div v-show="loadingAuxiliariesDetails[sector]" class="col-md-12 col-xs-12 spinner-container">
        <q-spinner size="25px" color="primary" />
      </div>
      <q-slide-transition>
        <span v-show="auxiliariesDetailsIsOpened[sector] && !loadingAuxiliariesDetails[sector]" class="sector-card row">
          <div v-for="auxiliary in auxiliariesStats[sector]" :key="auxiliary._id" class="col-md-6 col-xs-12">
            <div class="row person-name">
              <img :src="getAvatar(auxiliary.picture)" class="avatar">
              <div class="q-pl-md">
                {{ auxiliary.identity.firstname }} {{ auxiliary.identity.lastname.toUpperCase() }}
              </div>
            </div>
            <ni-auxiliary-indicators :hours-details="auxiliary.hoursBalanceDetail"
              :customers-details="auxiliary.paidIntervention" />
          </div>
        </span>
      </q-slide-transition>
    </q-card>
  </q-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ChipsAutocomplete from '../../../components/planning/ChipsAutocomplete';
import Gauge from '../../../components/Gauge';
import { AUXILIARY_ROLES, DEFAULT_AVATAR } from '../../../data/constants';
import { formatHours, roundFrenchPercentage } from '../../../helpers/utils';
import { NotifyNegative } from '../../../components/popup/notify';
import AuxiliaryIndicators from '../../../components/planning/AuxiliaryIndicators';

export default {
  name: 'Dashboard',
  metaInfo: { title: 'Tableau de bord' },
  components: {
    'ni-chips-autocomplete': ChipsAutocomplete,
    'ni-auxiliary-indicators': AuxiliaryIndicators,
    'ni-gauge': Gauge,
  },
  data () {
    return {
      selectedMonth: this.$moment().format('MM-YYYY'),
      terms: [],
      filteredSectors: [],
      customersAndDuration: [],
      internalAndBilledHours: [],
      hoursToWork: [],
      paidTransportStats: [],
      monthModal: false,
      firstInterventionStartDate: '',
      auxiliariesStats: {},
      auxiliariesDetailsIsOpened: {},
      loadingAuxiliariesDetails: {},
    };
  },
  computed: {
    ...mapGetters({
      mainUser: 'main/user',
      filters: 'planning/getFilters',
      elementToAdd: 'planning/getElementToAdd',
      elementToRemove: 'planning/getElementToRemove',
    }),
    monthsOptions () {
      if (this.firstInterventionStartDate === '') {
        return [
          { label: 'Mois en cours', value: this.$moment().format('MM-YYYY') },
          { label: 'Mois prochain', value: this.$moment().add(1, 'month').format('MM-YYYY') },
        ];
      }
      return Array.from(this.$moment().range(this.firstInterventionStartDate, this.$moment().add(1, 'M')).by('month'))
        .sort((a, b) => b.diff(a))
        .map(month => ({ label: month.format('MMMM YY'), value: month.format('MM-YYYY') }));
    },
    monthLabel () {
      const month = this.monthsOptions.find(m => m.value === this.selectedMonth);
      return month.label;
    },
  },
  watch: {
    async elementToAdd (val) {
      await this.addElementToFilter(val);
    },
    elementToRemove (val) {
      this.removeElementFromFilter(val);
    },
    auxiliariesDetailsIsOpened: {
      deep: true,
      immediate: true,
      async handler (sectors) {
        await this.getAuxiliariesStats();
      },
    },
  },
  async mounted () {
    await this.fillFilter();
    const firstIntervention = await this.$companies.getFirstIntervention();
    this.firstInterventionStartDate = this.$_.get(firstIntervention, 'startDate', null) || '';
    this.initFilters();
  },
  methods: {
    ...mapActions({
      fillFilter: 'planning/fillFilter',
    }),
    getAvatar (picture) {
      return (!picture || !picture.link) ? DEFAULT_AVATAR : picture.link;
    },
    initFilters () {
      if (AUXILIARY_ROLES.includes(this.mainUser.role.name)) {
        const userSector = this.filters.find(filter => filter._id === this.mainUser.sector);
        if (userSector) this.$refs.teamAutocomplete.add(userSector.label);
      }
    },
    formatHours,
    roundFrenchPercentage,
    async selectMonth (month) {
      this.selectedMonth = month;
      this.monthModal = false;
      this.auxiliariesStats = {};
      await this.refresh();
    },
    getIcon (sector) {
      return this.auxiliariesDetailsIsOpened[sector] ? 'expand_less' : 'expand_more';
    },
    sectorName (sectorId) {
      const sector = this.filters.find(s => s._id === sectorId);
      return sector.label;
    },
    async getAuxiliariesStats () {
      try {
        const sectors = [];
        const auxiliariesStats = {}
        for (const sector of this.filteredSectors) {
          if (this.auxiliariesStats[sector] || !this.auxiliariesDetailsIsOpened[sector]) continue;
          sectors.push(sector);
          this.$set(this.loadingAuxiliariesDetails, sector, true);
          auxiliariesStats[sector] = [];
        }
        if (!sectors.length) return;

        const paidInterventionStatsByAuxiliary = await this.$stats.getPaidInterventionStats({
          sector: sectors,
          month: this.selectedMonth,
        });

        const hoursBalanceDetail = await this.$pay.getHoursBalanceDetail({
          sector: sectors,
          month: this.selectedMonth,
        });

        for (const auxiliaryPaidInterventions of paidInterventionStatsByAuxiliary) {
          for (const sector of auxiliaryPaidInterventions.sectors) {
            if (!sectors.includes(sector)) continue;
            const auxiliaryHoursDetails = hoursBalanceDetail.find(hbd =>
              hbd.auxiliaryId === auxiliaryPaidInterventions._id);
            const auxiliaryStats = {
              _id: auxiliaryPaidInterventions._id,
              identity: auxiliaryHoursDetails.identity,
              picture: auxiliaryHoursDetails.picture,
              paidIntervention: this.$_.omit(auxiliaryPaidInterventions, 'sectors'),
              hoursBalanceDetail: this.$_.omit(auxiliaryHoursDetails, ['sectors', 'auxiliary']),
            }
            auxiliariesStats[sector].push(auxiliaryStats);
            this.$set(this.auxiliariesStats, sector, auxiliariesStats[sector]);
          }
        }
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des données')
      } finally {
        this.loadingAuxiliariesDetails = {}
      }
    },
    getCustomersAndDurationBySector (sectorId) {
      const customersAndDuration = this.customersAndDuration.find(el => el.sector === sectorId);
      return customersAndDuration || { customerCount: 0, averageDuration: 0, auxiliaryTurnOver: 0 };
    },
    getBilledHours (sectorId) {
      const billedHours = this.internalAndBilledHours.find(el => el.sector === sectorId);
      return billedHours ? billedHours.interventions : 0;
    },
    getInternalHoursRatio (sectorId) {
      const billedHours = this.internalAndBilledHours.find(el => el.sector === sectorId);
      const internalHours = billedHours ? billedHours.internalHours : 0;

      return (internalHours / this.getBilledHours(sectorId)) * 100 || 0;
    },
    getHoursToWork (sectorId) {
      const hoursToWork = this.hoursToWork.find(el => el.sector === sectorId);
      if (!hoursToWork) return 0;

      return hoursToWork.hoursToWork || 0;
    },
    getPaidTransportStats (sectorId) {
      const paidTransportStats = this.paidTransportStats.find(el => el.sector === sectorId);
      if (!paidTransportStats) return 0;

      return (paidTransportStats.duration / this.getBilledHours(sectorId)) * 100 || 0;
    },
    openAuxiliariesDetails (sectorId) {
      if (this.auxiliariesDetailsIsOpened[sectorId]) {
        this.$set(this.auxiliariesDetailsIsOpened, sectorId, false);
        return;
      }
      this.$set(this.auxiliariesDetailsIsOpened, sectorId, true);
    },
    hoursRatio (sector) {
      return (this.getBilledHours(sector) / this.getHoursToWork(sector)) * 100 || 0;
    },
    async refresh () {
      try {
        if (this.filteredSectors.length === 0) return;

        const params = { month: this.selectedMonth, sector: this.filteredSectors };
        const [customersAndDuration, internalAndBilledHours, hoursToWork, paidTransportStats] = await Promise.all([
          this.$stats.getCustomersAndDurationBySector(params),
          this.$stats.getInternalAndBilledHours(params),
          this.$pay.getHoursToWork(params),
          this.$events.getPaidTransportStatsBySector(params),
        ]);
        for (const sector of this.filteredSectors) {
          if (!this.$_.has(this.auxiliariesDetailsIsOpened, sector)) {
            this.$set(this.auxiliariesDetailsIsOpened, sector, false);
          }
        }
        this.internalAndBilledHours = internalAndBilledHours;
        this.customersAndDuration = customersAndDuration;
        this.hoursToWork = hoursToWork;
        this.paidTransportStats = paidTransportStats;
        await this.getAuxiliariesStats();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la réception des statistiques')
        this.customersAndDuration = [];
        this.internalAndBilledHours = [];
        this.hoursToWork = [];
        this.paidTransportStats = [];
      }
    },
    // Filter
    async addElementToFilter (sector) {
      this.filteredSectors.push(sector._id);
      await this.refresh();
    },
    async removeElementFromFilter (sector) {
      this.filteredSectors = this.filteredSectors.filter(sec => sec !== sector._id);
    },
  },
}
</script>

<style lang="stylus" scoped>
.stats-header
  display: flex
  justify-content: space-between
  align-items: center

.sector-name
  font-size: 24px

.month-label
  font-size: 14px
  font-style: italic

.auxiliary
  border-top: 1px solid $light-grey
  border-left: 1px solid $light-grey
  border-right: 1px solid $light-grey
  &:last-child
    border-bottom: 1px solid $light-grey

.auxiliary-label
  border-right: 1px solid $light-grey
  padding: 3px 4px

.auxiliary-value
  justify-content: flex-end
  display: flex
  padding: 5px

.month-select
  .q-icon
    margin-left: 5px

.sector-card
  margin: 0 16px 16px

/deep/ .q-circular-progress__text
  font-size: 15px
  color: black

.customer
  display: flex
  flex-direction: column
  justify-content: center;
  .col-4
    display: flex
    justify-content: center
    &:first-child
      color: $primary
    &:nth-child(2)
      color: $grey
    &:nth-child(3)
      color: $primary-dark
  &-value
    font-size: 48px
  &-label
    padding: 0 10px
    text-align: center

.spinner-container
  display: flex;
  justify-content: center;
  margin-bottom: 10px;

.gauge-wrapper
  display: flex
  justify-content: space-around
</style>
