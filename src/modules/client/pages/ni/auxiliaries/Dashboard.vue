<template>
  <q-page class="client-background q-pb-xl">
    <div class="title-padding row items-start">
      <div class="col-xs-12 col-md-5 row q-mb-md">
        <ni-chips-autocomplete ref="teamAutocomplete" v-model="terms" :filters="filters" />
      </div>
      <div class="col-xs-12 col-md-7 row justify-end">
        <q-btn icon-right="arrow_drop_down" :label="monthLabel" flat dense>
          <q-menu anchor="bottom right" self="top right">
            <q-list dense padding>
              <q-item v-for="(month, index) in monthsOptions" :key="index" clickable @click="selectMonth(month.value)"
                v-close-popup>
                <q-item-section>{{ month.label }}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-btn>
      </div>
    </div>
    <q-card v-for="sector of filteredSectors" :key="sector" class="sector-cell row">
      <q-card-section class="full-width" :class="{ 'card-height': displayStats[sector].loading }">
        <div v-if="!displayStats[sector].loading" class="row justify-between">
          <div class="col-md-6 col-xs-12">
            <div class="q-mb-lg stats-header">
              <div class="text-capitalize">
                <div class="sector-name text-weight-bold">{{ sectorName(sector) }}</div>
                <div class="month-label">{{ monthLabel }}</div>
              </div>
              <q-circular-progress :value="Math.min(hoursRatio(sector), 100)" size="60px" track-color="copper-grey-300"
                color="primary" show-value :thickness="0.2" class="text-weight-bold">
                {{ roundFrenchPercentage(hoursRatio(sector), 0).replace('&nbsp;', '') }}
              </q-circular-progress>
            </div>
            <div class="q-mb-lg">
              <div v-if="displayCounter(sector)" class="row auxiliary">
                <div class="col-8 auxiliary-label">Compteur d'heures</div>
                <div class="col-4 auxiliary-value">
                  <div :class="['dot', stats[sector].hoursCounterStatus]" />
                </div>
              </div>
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
            <div class="gauge-wrapper">
              <ni-gauge v-if="getInternalHours(sector) !== 0" :min="5" :max="20" :value="getInternalHoursRatio(sector)">
                <template #title>
                  <div class="q-mt-sm">
                    <span class="text-weight-bold">Heures internes</span> -
                    {{ formatHours(getInternalHours(sector)) }}
                  </div>
                </template>
              </ni-gauge>
              <ni-gauge v-if="getPaidTransport(sector) !== 0" :min="7" :max="16" :value="getPaidTransportRatio(sector)">
                <template #title>
                  <div class="q-mt-sm">
                    <span class="text-weight-bold">Transports</span> - {{ formatHours(getPaidTransport(sector)) }}
                  </div>
                </template>
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
      <q-card-actions v-show="!displayStats[sector].loading" align="right" class="full-width column items-end">
        <q-btn flat no-caps color="primary" :icon="getIcon(sector)" label="Voir le détail par auxiliaire"
          @click="openAuxiliariesDetails(sector)" />
        <q-slide-transition>
          <div v-show="displayStats[sector].openedDetails" class="auxiliary-cell-container row">
            <div v-for="auxiliary in auxiliariesStats[sector]" :key="`${sector}-${auxiliary._id}`"
              class="col-md-6 col-xs-12 auxiliary-cell q-mb-lg">
              <div class="row person-name q-mb-md">
                <img :src="getAvatar(auxiliary.picture)" class="avatar">
                <div class="q-pl-md">
                  {{ auxiliary.identity.firstname }} {{ auxiliary.identity.lastname.toUpperCase() }}
                </div>
              </div>
              <ni-auxiliary-indicators :hours-details="auxiliary.hoursBalanceDetail"
                :customers-details="auxiliary.paidInterventions" />
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
import { createMetaMixin } from 'quasar';
import get from 'lodash/get';
import set from 'lodash/set';
import omit from 'lodash/omit';
import { mapActions, mapGetters, mapState } from 'vuex';
import Companies from '@api/Companies';
import Pay from '@api/Pay';
import Events from '@api/Events';
import Stats from '@api/Stats';
import { NotifyNegative } from '@components/popup/notify';
import { AUXILIARY_ROLES, DEFAULT_AVATAR } from '@data/constants';
import { roundFrenchPercentage } from '@helpers/utils';
import { formatHours } from '@helpers/date';
import moment from '@helpers/moment';
import Gauge from 'src/modules/client/components/Gauge';
import ChipsAutocomplete from 'src/modules/client/components/planning/ChipsAutocomplete';
import AuxiliaryIndicators from 'src/modules/client/components/planning/AuxiliaryIndicators';

const metaInfo = { title: 'Tableau de bord' };
export default {
  name: 'Dashboard',
  components: {
    'ni-chips-autocomplete': ChipsAutocomplete,
    'ni-auxiliary-indicators': AuxiliaryIndicators,
    'ni-gauge': Gauge,
  },
  mixins: [createMetaMixin(metaInfo)],
  data () {
    return {
      selectedMonth: moment().format('MM-YYYY'),
      terms: [],
      filteredSectors: [],
      unassignedHours: [],
      firstInterventionStartDate: '',
      auxiliariesStats: {},
      displayStats: {},
      stats: {},
    };
  },
  computed: {
    ...mapState({
      loggedUser: state => state.main.loggedUser,
      filters: state => state.planning.filters,
      elementToAdd: state => state.planning.elementToAdd,
      elementToRemove: state => state.planning.elementToRemove,
    }),
    ...mapGetters({
      company: 'main/getCompany',
      clientRole: 'main/getClientRole',
    }),
    monthsOptions () {
      if (this.firstInterventionStartDate === '') {
        return [
          { label: moment().format('MMMM YY'), value: moment().format('MM-YYYY') },
          {
            label: moment().add(1, 'month').format('MMMM YY'),
            value: moment().add(1, 'month').format('MM-YYYY'),
          },
        ];
      }
      return Array.from(moment().range(this.firstInterventionStartDate, moment().add(1, 'M')).by('month'))
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
  async created () {
    await this.fillFilter({ company: this.company });
    const firstIntervention = await Companies.getFirstIntervention();
    this.firstInterventionStartDate = get(firstIntervention, 'startDate', null) || '';
    this.initFilters();
  },
  methods: {
    ...mapActions({ fillFilter: 'planning/fillFilter' }),
    getAvatar (picture) {
      return (get(picture, 'link')) || DEFAULT_AVATAR;
    },
    initFilters () {
      if (AUXILIARY_ROLES.includes(this.clientRole)) {
        const userSector = this.filters.find(filter => filter._id === this.loggedUser.sector);
        if (userSector) this.$refs.teamAutocomplete.add(userSector);
      }
    },
    formatHours,
    roundFrenchPercentage,
    async selectMonth (month) {
      this.selectedMonth = month;
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
        const auxiliariesStats = {};
        for (const sector of sectorsIds) {
          if (this.auxiliariesStats[sector]) continue;
          sectors.push(sector);
          auxiliariesStats[sector] = [];
        }
        if (!sectors.length) return;

        const [paidInterventions, hoursBalance] = await Promise.all([
          Stats.getPaidInterventionStats({ sector: sectors, month: this.selectedMonth }),
          Pay.getHoursBalanceDetail({ sector: sectors, month: this.selectedMonth }),
        ]);

        for (const auxHoursDetails of hoursBalance) {
          for (const sector of auxHoursDetails.sectors) {
            if (!sectors.includes(sector)) continue;
            const auxPaidInterventions = paidInterventions.find(pi => pi._id === auxHoursDetails.auxiliaryId);

            auxiliariesStats[sector].push({
              _id: auxHoursDetails.auxiliaryId,
              identity: auxHoursDetails.identity,
              picture: auxHoursDetails.picture,
              paidInterventions: omit(auxPaidInterventions, 'sectors'),
              hoursBalanceDetail: omit(auxHoursDetails, ['sectors', 'auxiliary']),
            });
            set(this.auxiliariesStats, sector, auxiliariesStats[sector]);
          }
        }
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des données.');
      }
    },
    getCustomersAndDurationBySector (sectorId) {
      return this.stats[sectorId].customersAndDuration ||
        { customerCount: 0, averageDuration: 0, auxiliaryTurnOver: 0 };
    },
    getBilledHours (sectorId) {
      return this.stats[sectorId].internalAndBilledHours
        ? this.stats[sectorId].internalAndBilledHours.interventions
        : 0;
    },
    displayCounter (sector) {
      if (!this.auxiliariesStats || !this.auxiliariesStats[sector]) return false;
      return this.auxiliariesStats[sector].every(stat => stat.hoursBalanceDetail.counterAndDiffRelevant);
    },
    getCounterStatus (sector) {
      if (!this.auxiliariesStats || !this.auxiliariesStats[sector]) return '';
      if (this.auxiliariesStats[sector].every(aux => aux.hoursBalanceDetail.hoursCounter >= 0)) return 'bg-green-600';
      if (this.auxiliariesStats[sector].some(aux => aux.hoursBalanceDetail.hoursCounter <= -35)) return 'bg-red-800';
      return 'bg-orange-500';
    },
    getInternalHours (sectorId) {
      return this.stats[sectorId].internalAndBilledHours
        ? this.stats[sectorId].internalAndBilledHours.internalHours
        : 0;
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
        moment(this.selectedMonth, 'MM-YYYY').isAfter(moment().subtract(1, 'month'), 'month');
    },
    getUnassignedHours (sectorId) {
      return this.unassignedHours.find(el => el.sector === sectorId).duration;
    },
    async openAuxiliariesDetails (sectorId) {
      if (this.displayStats[sectorId].openedDetails) {
        set(this.displayStats[sectorId], 'openedDetails', false);
        return;
      }
      set(this.displayStats[sectorId], 'openedDetails', true);
    },
    hoursRatio (sector) {
      return (this.getBilledHours(sector) / this.getHoursToWork(sector)) * 100 || 0;
    },
    async refresh (sectors) {
      try {
        if (sectors.length === 0) return;

        this.setDisplayStats(sectors, { loading: true, openedDetails: false });
        const params = { month: this.selectedMonth, sector: sectors };
        const [customersAndDuration, internalAndBilledHours, hoursToWork, paidTransportStats] = await Promise.all([
          Stats.getCustomersAndDurationBySector(params),
          Stats.getInternalAndBilledHours(params),
          Pay.getHoursToWork(params),
          Events.getPaidTransportStatsBySector(params),
        ]);

        if (moment(this.selectedMonth, 'MM-YYYY').isAfter(moment().subtract(1, 'month'), 'month')) {
          this.unassignedHours = await Events.getUnassignedHoursBySector(params);
        } else {
          this.unassignedHours = [];
        }
        await this.getAuxiliariesStats(sectors);

        for (const sector of sectors) {
          this.stats = {
            ...this.stats,
            [sector]: {
              internalAndBilledHours: internalAndBilledHours.find(ibh => ibh.sector === sector),
              customersAndDuration: customersAndDuration.find(cd => cd.sector === sector),
              hoursToWork: hoursToWork.find(hw => hw.sector === sector),
              paidTransportStats: paidTransportStats.find(pt => pt.sector === sector),
              hoursCounterStatus: this.getCounterStatus(sector),
            },
          };
        }

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
      delete this.stats[sector._id];
    },
    setDisplayStats (sectors, data) {
      for (const sector of sectors) {
        this.displayStats = { ...this.displayStats, [sector]: { ...this.displayStats[sector], ...data } };
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.stats-header
  display: flex
  justify-content: space-between

.sector-name
  font-size: 24px

.month-label
  font-size: 14px
  font-style: italic

.auxiliary
  border-left: 1px solid $copper-grey-300
  border-right: 1px solid $copper-grey-300
  border-bottom: 1px solid $copper-grey-300
  &:nth-child(1)
    border-top: 1px solid $copper-grey-300
  div
    padding: 5px
  &-cell
    display: flex
    flex-direction: column
    &:not(:nth-last-child(-n+2))
      border-bottom: 1px solid $copper-grey-300
    &-container
      padding: 0 16px
      width: 100%
      @media screen and (max-width: 767px)
        padding: 0 8px

.auxiliary-label
  border-right: 1px solid $copper-grey-300

.auxiliary-value
  justify-content: flex-end
  align-items: center
  display: flex

.dot
  margin: 0px !important

.sector-cell
  margin: 0 16px 16px
  @media screen and (max-width: 767px)
    font-size: 12px

.customer
  display: flex
  flex-direction: column
  justify-content: center
  @media screen and (max-width: 767px)
    margin-top: 8px
  .col-4
    display: flex
    justify-content: center
    &:first-child
      color: $primary
    &:nth-child(2)
      color: $secondary
    &:nth-child(3)
      color: $copper-grey-400
  &-value
    font-size: 48px
    @media screen and (max-width: 767px)
      font-size: 24px
  &-label
    padding: 0 10px
    text-align: center

.spinner-container
  display: flex
  justify-content: center
  margin-bottom: 10px

.gauge-wrapper
  display: flex
  justify-content: space-around
  @media screen and (max-width: 767px)
    justify-content: space-between

.unassigned-hours
  font-style: italic
  font-size: 14px
  padding-left: 5px

.card-height
  height: 100px

.person-name
  font-size: 14px !important
</style>
