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
      <div class="col-md-6 col-xs-12 q-pa-md">
        <div class="sector-name q-mb-lg text-weight-bold">
          {{ sectorName(sector) }}
          <q-circular-progress :value="Math.min(hoursRatio(sector), 100)" size="60px" track-color="grey-5" color="primary" show-value
            :thickness="0.3">
            {{ roundFrenchPercentage(Math.round(hoursRatio(sector)) / 100, 0).replace('&nbsp;', '') }}
          </q-circular-progress>
        </div>
        <div class="q-mb-md">
          <div class="row stats-row">
            <div class="col-8 stats-row-title"># bénéficiaires</div>
            <div class="col-4 stats-row-value">{{ getCustomersAndDurationBySector(sector).customerCount }}</div>
          </div>
          <div class="row stats-row">
            <div class="col-8 stats-row-title">Heures / bénéficiaire</div>
            <div class="col-4 stats-row-value">{{ formatHours(Math.round(getHoursByCustomer(sector)), 0) }}</div>
          </div>
          <div class="row stats-row">
            <div class="col-8 stats-row-title text-weight-bold">Heures facturées</div>
            <div class="col-4 stats-row-value text-weight-bold">
              {{ formatHours(Math.round(getCustomersAndDurationBySector(sector).duration), 0) }}
            </div>
          </div>
        </div>
        <div>
          <div class="row stats-row">
            <div class="col-8 stats-row-title">Heures à travailler</div>
            <div class="col-4 stats-row-value">{{ formatHours(Math.round(getHoursToWork(sector)), 0) }}</div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xs-12"></div>
      <div class="col-md-12 col-xs-12">
        <q-card-actions align="right">
          <template>
            <q-btn flat no-caps color="primary" :icon="getIcon(sector)" label="Voir le détail par auxiliaire"
              @click="openAuxiliariesDetails(sector)" />
          </template>
        </q-card-actions>
      </div>
      <q-slide-transition>
        <span v-show="auxiliariesDetailsIsOpened[sector]" class="sector-card row">
          <div v-for="auxiliary in customersAndDurationByAuxiliary[sector]" :key="auxiliary._id" class="col-md-6 col-xs-12">
            {{ auxiliary }}
          </div>
        </span>
      </q-slide-transition>
    </q-card>
  </q-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import ChipsAutocomplete from '../../../components/planning/ChipsAutocomplete';
import { AUXILIARY_ROLES } from '../../../data/constants';
import { formatHours, roundFrenchPercentage } from '../../../helpers/utils';
import { NotifyNegative } from '../../../components/popup/notify';

export default {
  name: 'Dashboard',
  metaInfo: { title: 'Tableau de bord' },
  components: {
    'ni-chips-autocomplete': ChipsAutocomplete,
  },
  data () {
    return {
      selectedMonth: this.$moment().format('MMYYYY'),
      terms: [],
      filteredSectors: [],
      customersAndDuration: [],
      hoursToWork: [],
      monthModal: false,
      firstInterventionStartDate: '',
      customersAndDurationByAuxiliary: {},
      auxiliariesDetailsIsOpened: {},
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
          { label: 'Mois en cours', value: this.$moment().format('MMYYYY') },
          { label: 'Mois prochain', value: this.$moment().add(1, 'month').format('MMYYYY') },
        ];
      }
      return Array.from(this.$moment().range(this.firstInterventionStartDate, this.$moment().add(1, 'M')).by('month'))
        .sort((a, b) => b.diff(a))
        .map(month => ({ label: month.format('MMMM YY'), value: month.format('MMYYYY') }));
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
        await this.getcustomersAndDurationByAuxiliary(sectors);
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
      this.customersAndDurationByAuxiliary = {};
      await this.refresh();
    },
    getIcon (sector) {
      return this.auxiliariesDetailsIsOpened[sector] ? 'expand_less' : 'expand_more';
    },
    sectorName (sectorId) {
      const sector = this.filters.find(s => s._id === sectorId);
      return sector.label;
    },
    async getcustomersAndDurationByAuxiliary (sectors) {
      for (let i = 0; i < sectors.length; i++) {
        const sector = sectors[i];
        if (this.customersAndDurationByAuxiliary[sector]) continue;
        const customersAndDurationByAuxiliaryArray = await this.$stats.getCustomersAndDurationByAuxiliary({ sector, month: this.selectedMonth });
        for (const customersAndDurationByAuxiliary of customersAndDurationByAuxiliaryArray) {
          this.$set(this.customersAndDurationByAuxiliary, customersAndDurationByAuxiliary.sector, customersAndDurationByAuxiliary.customersAndDuration);
        }
      }
    },
    getCustomersAndDurationBySector (sectorId) {
      const customersAndDuration = this.customersAndDuration.find(el => el.sector === sectorId);
      return customersAndDuration || { customerCount: 0, duration: 0 };
    },
    getHoursToWork (sectorId) {
      const hoursToWork = this.hoursToWork.find(el => el.sector === sectorId);
      if (!hoursToWork) return 0;

      return hoursToWork.hoursToWork || 0;
    },
    getHoursByCustomer (sector) {
      const customersAndDuration = this.getCustomersAndDurationBySector(sector);
      if (!customersAndDuration) return 0;

      return customersAndDuration.duration / customersAndDuration.customerCount;
    },
    async openAuxiliariesDetails (sectorId) {
      if (this.auxiliariesDetailsIsOpened[sectorId]) {
        this.$set(this.auxiliariesDetailsIsOpened, sectorId, false);
        return;
      }
      this.$set(this.auxiliariesDetailsIsOpened, sectorId, true);
    },
    hoursRatio (sector) {
      return (this.getCustomersAndDurationBySector(sector).duration / this.getHoursToWork(sector)) * 100 || 0;
    },
    async refresh () {
      try {
        if (this.filteredSectors.length === 0) return;

        const params = { month: this.selectedMonth, sector: this.filteredSectors };
        const [customersAndDuration, hoursToWork] = await Promise.all([
          this.$stats.getCustomersAndDurationBySector(params),
          this.$pay.getHoursToWork(params),
        ]);
        for (const sector of this.filteredSectors) {
          if (!this.$_.has(this.auxiliariesDetailsIsOpened, sector)) this.$set(this.auxiliariesDetailsIsOpened, sector, false);
        }
        this.customersAndDuration = customersAndDuration;
        this.hoursToWork = hoursToWork;
        await this.getcustomersAndDurationByAuxiliary(this.filteredSectors);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la réception des statistiques')
        this.customersAndDuration = [];
        this.hoursToWork = [];
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
.sector-name
  font-size: 24px
  display: flex
  justify-content: space-between
  align-items: center

.stats-row
  border-top: 1px solid $light-grey
  border-left: 1px solid $light-grey
  border-right: 1px solid $light-grey
  &:last-child
    border-bottom: 1px solid $light-grey

.stats-row-title
  border-right: 1px solid $light-grey
  padding: 3px 4px

.stats-row-value
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
</style>
