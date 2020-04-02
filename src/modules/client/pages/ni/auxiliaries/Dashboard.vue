<template>
  <q-page class="neutral-background">
    <div class="title-padding row items-start">
      <div class="col-xs-12 col-md-5 row q-mb-md">
        <ni-chips-autocomplete ref="teamAutocomplete" v-model="terms" :filters="filters" />
      </div>
      <div class="col-xs-12 col-md-7 row justify-end">
        <q-btn icon-right="arrow_drop_down" :label="monthLabel" flat dense>
          <q-menu anchor="bottom right" self="top right">
            <q-list dense padding>
              <q-item v-for="(month, index) in monthsOptions" :key="index" clickable @click="selectMonth(month.value)">
                <q-item-section>{{ month.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
    <q-card v-for="sector of filteredSectors" :key="sector" class="sector-card row">
      <q-card-section class="full-width" :class="{ 'card-height': displayStats[sector].loading }">
        <div v-if="!displayStats[sector].loading" class="row justify-between">
          <div class="col-md-6 col-xs-12">
            <div class="q-mb-lg stats-header">
              <div class="text-capitalize">
                <div class="sector-name text-weight-bold">{{ sectorName(sector) }}</div>
                <div class="month-label">{{ monthLabel }}</div>
              </div>
              <q-circular-progress :value="Math.min(hoursRatio(sector), 100)" size="60px" track-color="grey-5"
                color="primary" show-value :thickness="0.2" class="text-weight-bold">
                {{ roundFrenchPercentage(hoursRatio(sector), 0).replace('&nbsp;', '') }}
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
              <div class="row unassigned-hours" v-if="shouldDisplayUnassignedHours(sector)">
                <div class="col-12">{{ formatHours(getUnassignedHours(sector)) }} à affecter</div>
              </div>
            </div>
            <div class="q-pt-md gauge-wrapper">
              <ni-gauge v-if="getInternalHours(sector) !== 0" :min="5" :max="20" :value="getInternalHoursRatio(sector)">
                <div slot="title" class="q-mt-sm">
                  <span class="text-weight-bold">Heures internes</span> -
                  {{ formatHours(getInternalHours(sector)) }}
                </div>
              </ni-gauge>
              <ni-gauge v-if="getPaidTransport(sector) !== 0" :min="7" :max="16" :value="getPaidTransportRatio(sector)">
                <div slot="title" class="q-mt-sm">
                  <span class="text-weight-bold">Transports</span> - {{ formatHours(getPaidTransport(sector)) }}
                </div>
              </ni-gauge>
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
                  {{ Math.round(getCustomersAndDurationBySector(sector).auxiliaryTurnOver * 10) / 10 }}
                </div>
              </div>
              <div class="row">
                <div class="col-4 customer-label">Bénéficiaires</div>
                <div class="col-4 customer-label">Heures par bénéficiaire</div>
                <div class="col-4 customer-label">Auxiliaires par bénéficiaires</div>
              </div>
            </template>
          </div>
        </div>
      </q-card-section>
      <q-card-actions v-show="!displayStats[sector].loading" align="right" class="full-width">
        <q-btn flat no-caps color="primary" :icon="getIcon(sector)" label="Voir le détail par auxiliaire"
          @click="openAuxiliariesDetails(sector)" />
        <div v-show="displayStats[sector].loadingDetails" class="col-md-12 col-xs-12 spinner-container">
          <q-spinner-facebook size="25px" color="primary" />
        </div>
        <q-slide-transition>
          <div v-show="displayStats[sector].openedDetails && !displayStats[sector].loadingDetails"
            class="sector-card row">
            <div v-for="auxiliary in auxiliariesStats[sector]" :key="auxiliary._id"
              class="col-md-6 col-xs-12 auxiliary-card q-mb-lg q-pb-lg">
              <div class="row person-name">
                <img :src="getAvatar(auxiliary.picture)" class="avatar">
                <div class="q-pl-md">
                  {{ auxiliary.identity.firstname }} {{ auxiliary.identity.lastname.toUpperCase() }}
                </div>
              </div>
              <ni-auxiliary-indicators :hours-details="auxiliary.hoursBalanceDetail"
                :customers-details="auxiliary.paidIntervention" />
            </div>
          </div>
        </q-slide-transition>
      </q-card-actions>
      <q-inner-loading :showing="displayStats[sector].loading">
        <q-spinner-facebook size="30px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import omit from 'lodash/omit';
import { mapActions, mapGetters } from 'vuex';
import Companies from '@api/Companies';
import Pay from '@api/Pay';
import Events from '@api/Events';
import Stats from '@api/Stats';
import { NotifyNegative } from '@components/popup/notify';
import { formatHours, roundFrenchPercentage } from '@helpers/utils';
import { AUXILIARY_ROLES, DEFAULT_AVATAR } from '@data/constants';
import Gauge from 'src/modules/client/components/Gauge';
import ChipsAutocomplete from 'src/modules/client/components/planning/ChipsAutocomplete';
import AuxiliaryIndicators from 'src/modules/client/components/planning/AuxiliaryIndicators';

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
      unassignedHours: [],
      monthModal: false,
      firstInterventionStartDate: '',
      auxiliariesStats: {},
      displayStats: {},
      stats: {},
    };
  },
  computed: {
    ...mapGetters({
      loggedUser: 'main/loggedUser',
      filters: 'planning/getFilters',
      elementToAdd: 'planning/getElementToAdd',
      elementToRemove: 'planning/getElementToRemove',
    }),
    monthsOptions () {
      if (this.firstInterventionStartDate === '') {
        return [
          { label: this.$moment().format('MMMM YY'), value: this.$moment().format('MM-YYYY') },
          {
            label: this.$moment().add(1, 'month').format('MMMM YY'),
            value: this.$moment().add(1, 'month').format('MM-YYYY'),
          },
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
  },
  async mounted () {
    await this.fillFilter({ loggedUser: this.loggedUser });
    const firstIntervention = await Companies.getFirstIntervention();
    this.firstInterventionStartDate = get(firstIntervention, 'startDate', null) || '';
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
      if (AUXILIARY_ROLES.includes(this.loggedUser.role.client.name)) {
        const userSector = this.filters.find(filter => filter._id === this.loggedUser.sector);
        if (userSector) this.$refs.teamAutocomplete.add(userSector.label);
      }
    },
    formatHours,
    roundFrenchPercentage,
    async selectMonth (month) {
      this.selectedMonth = month;
      this.monthModal = false;
      this.auxiliariesStats = {};
      await this.refresh(this.filteredSectors);
    },
    getIcon (sector) {
      return this.displayStats[sector].openedDetails ? 'expand_less' : 'expand_more';
    },
    sectorName (sectorId) {
      const sector = this.filters.find(s => s._id === sectorId);
      return sector.label;
    },
    async getAuxiliariesStats (sectorsIds) {
      try {
        const sectors = [];
        const auxiliariesStats = {}
        for (const sector of sectorsIds) {
          if (this.auxiliariesStats[sector] || !this.displayStats[sector].openedDetails) continue;
          sectors.push(sector);
          this.$set(this.displayStats[sector], 'loadingDetails', true);
          auxiliariesStats[sector] = [];
        }
        if (!sectors.length) return;

        const paidInterventionStatsByAuxiliary = await Stats.getPaidInterventionStats({
          sector: sectors,
          month: this.selectedMonth,
        });

        const hoursBalanceDetail = await Pay.getHoursBalanceDetail({
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
              paidIntervention: omit(auxiliaryPaidInterventions, 'sectors'),
              hoursBalanceDetail: omit(auxiliaryHoursDetails, ['sectors', 'auxiliary']),
            }
            auxiliariesStats[sector].push(auxiliaryStats);
            this.$set(this.auxiliariesStats, sector, auxiliariesStats[sector]);
          }
        }
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des données.')
      } finally {
        this.setDisplayStats(sectorsIds, { loadingDetails: false });
      }
    },
    getCustomersAndDurationBySector (sectorId) {
      return this.stats[sectorId].customersAndDuration || { customerCount: 0, averageDuration: 0, auxiliaryTurnOver: 0 };
    },
    getBilledHours (sectorId) {
      return this.stats[sectorId].internalAndBilledHours ? this.stats[sectorId].internalAndBilledHours.interventions : 0;
    },
    getInternalHours (sectorId) {
      return this.stats[sectorId].internalAndBilledHours ? this.stats[sectorId].internalAndBilledHours.internalHours : 0;
    },
    getInternalHoursRatio (sectorId) {
      return (this.getInternalHours(sectorId) / this.getBilledHours(sectorId)) * 100 || 0;
    },
    getHoursToWork (sectorId) {
      if (!this.stats[sectorId].hoursToWork) return 0;

      return this.stats[sectorId].hoursToWork.hoursToWork || 0;
    },
    getPaidTransport (sectorId) {
      return this.stats[sectorId].paidTransportStats ? this.stats[sectorId].paidTransportStats.duration : 0;
    },
    getPaidTransportRatio (sectorId) {
      return (this.getPaidTransport(sectorId) / this.getBilledHours(sectorId)) * 100 || 0;
    },
    shouldDisplayUnassignedHours (sectorId) {
      return this.unassignedHours.find(el => el.sector === sectorId) &&
        this.$moment(this.selectedMonth, 'MM-YYYY').isAfter(this.$moment().subtract(1, 'month'), 'month');
    },
    getUnassignedHours (sectorId) {
      return this.unassignedHours.find(el => el.sector === sectorId).duration;
    },
    async openAuxiliariesDetails (sectorId) {
      if (this.displayStats[sectorId].openedDetails) {
        this.$set(this.displayStats[sectorId], 'openedDetails', false);
        return;
      }
      this.$set(this.displayStats[sectorId], 'openedDetails', true);
      await this.getAuxiliariesStats([sectorId]);
    },
    hoursRatio (sector) {
      return (this.getBilledHours(sector) / this.getHoursToWork(sector)) * 100 || 0;
    },
    async refresh (sectors) {
      try {
        if (!sectors.length === 0) return;

        this.setDisplayStats(sectors, { loading: true, openedDetails: false });
        const params = { month: this.selectedMonth, sector: sectors };
        const [customersAndDuration, internalAndBilledHours, hoursToWork, paidTransportStats] = await Promise.all([
          Stats.getCustomersAndDurationBySector(params),
          Stats.getInternalAndBilledHours(params),
          Pay.getHoursToWork(params),
          Events.getPaidTransportStatsBySector(params),
        ]);
        if (this.$moment(this.selectedMonth, 'MM-YYYY').isAfter(this.$moment().subtract(1, 'month'), 'month')) {
          this.unassignedHours = await Events.getUnassignedHoursBySector(params);
        } else {
          this.unassignedHours = [];
        }

        for (const sector of sectors) {
          this.stats = {
            ...this.stats,
            [sector]: {
              internalAndBilledHours: internalAndBilledHours.find(ibh => ibh.sector === sector),
              customersAndDuration: customersAndDuration.find(cd => cd.sector === sector),
              hoursToWork: hoursToWork.find(hw => hw.sector === sector),
              paidTransportStats: paidTransportStats.find(pt => pt.sector === sector),
            },
          }
        }
        await this.getAuxiliariesStats(sectors);
        this.setDisplayStats(sectors, { loading: false });
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la réception des statistiques.');
        for (const sector of sectors) {
          delete this.stats[sector];
        }
      }
    },
    // Filter
    async addElementToFilter (sector) {
      this.filteredSectors.push(sector._id);
      await this.refresh([sector._id]);
    },
    async removeElementFromFilter (sector) {
      this.filteredSectors = this.filteredSectors.filter(sec => sec !== sector._id);
      delete this.displayStats[sector._id];
    },
    setDisplayStats (sectors, data) {
      for (const sector of sectors) {
        this.displayStats = {
          ...this.displayStats,
          [sector]: { ...this.displayStats[sector], ...data },
        };
      }
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
  &:nth-child(2)
    border-bottom: 1px solid $light-grey

.auxiliary-label
  border-right: 1px solid $light-grey
  padding: 3px 4px

.auxiliary-value
  justify-content: flex-end
  display: flex
  padding: 5px

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
      color: $secondary
    &:nth-child(3)
      color: $grey
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

.auxiliary-card
  display: flex
  flex-direction: column
  &:not(:nth-last-child(-n+2))
    border-bottom: 1px solid $light-grey

.unassigned-hours
  font-style: italic
  font-size: 14px
  padding-left: 5px

.card-height
  height: 100px

</style>
