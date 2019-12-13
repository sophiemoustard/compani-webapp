<template>
  <q-page class="neutral-background">
    <div class="title-padding row items-start">
      <div class="col-xs-12 col-md-5 row q-mb-md">
        <ni-chips-autocomplete ref="teamAutocomplete" v-model="terms" :filters="filters" />
      </div>
      <div class="col-xs-12 col-md-7 row justify-end">
        <ni-select v-model="month" :options="monthsOptions" @input="refresh" />
      </div>
    </div>
    <q-card v-for="sector of filteredSectors" :key="sector" class="q-ma-md row">
      <div class="col-md-6 col-xs-12 q-pa-md">
        <div class="sector-name q-mb-lg">{{ sectorName(sector) }}</div>
        <div class="q-mb-md">
          <div class="row stats-row">
            <div class="col-8 stats-row-title"># bénéficiaires</div>
            <div class="col-4 stats-row-value">{{ getCustomersAndDuration(sector).customerCount }}</div>
          </div>
          <div class="row stats-row">
            <div class="col-8 stats-row-title">Heures / bénéficiaire</div>
            <div class="col-4 stats-row-value">{{ formatHours(getHoursByCustomer(sector)) }}</div>
          </div>
          <div class="row stats-row">
            <div class="col-8 stats-row-title">Heures</div>
            <div class="col-4 stats-row-value">{{ formatHours(getCustomersAndDuration(sector).duration) }}</div>
          </div>
        </div>
        <div>
          <div class="row stats-row">
            <div class="col-8 stats-row-title">Heures à travailler</div>
            <div class="col-4 stats-row-value"></div>
          </div>
        </div>
      </div>
      <div class="col-md-6 col-xs-12"></div>
    </q-card>
  </q-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Select from '../../../components/form/Select';
import ChipsAutocomplete from '../../../components/planning/ChipsAutocomplete';
import { AUXILIARY_ROLES } from '../../../data/constants';
import { formatHours } from '../../../helpers/utils';

export default {
  name: 'Dashboard',
  metaInfo: { title: 'Tableau de bord' },
  components: {
    'ni-select': Select,
    'ni-chips-autocomplete': ChipsAutocomplete,
  },
  data () {
    return {
      month: this.$moment().format('MMYYYY'),
      terms: [],
      filteredSectors: [],
      customerAndDuration: [],
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
      const companyCreationDate = this.$_.get(this.mainUser, 'company.createdAt', null);
      if (!companyCreationDate) {
        return [{ label: this.$moment().format('MMMM YY'), value: this.$moment().format('MMYYYY') }];
      }

      return Array.from(this.$moment().range(companyCreationDate, this.$moment().add(1, 'M')).by('month'))
        .sort((a, b) => b.diff(a))
        .map(month => ({ label: month.format('MMMM YY'), value: month.format('MMYYYY') }));
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
    await this.fillFilter();
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
    sectorName (sectorId) {
      const sector = this.filters.find(s => s._id === sectorId);
      return sector.label;
    },
    getCustomersAndDuration (sectorId) {
      const customerAndDuration = this.customerAndDuration.find(el => el.sector === sectorId);
      return customerAndDuration || { customerCount: 0, duration: 0 };
    },
    getHoursByCustomer (sector) {
      const customerAndDuration = this.getCustomersAndDuration(sector);
      if (!customerAndDuration) return 0;

      return customerAndDuration.duration / customerAndDuration.customerCount;
    },
    async refresh () {
      try {
        const params = { month: this.month, sector: this.filteredSectors };
        this.customerAndDuration = await this.$stats.getCustomersAndDuration(params);
      } catch (e) {
        this.customerAndDuration = [];
      }
    },
    // Filter
    async addElementToFilter (el) {
      this.filteredSectors.push(el._id);
      await this.refresh();
    },
    async removeElementFromFilter (el) {
      this.filteredSectors = this.filteredSectors.filter(sec => sec !== el._id);
    },
  },
}
</script>

<style lang="stylus" scoped>
.sector-name
  font-size: 24px

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
  justify-content: flex-end;
  display: flex;
  padding: 5px
</style>
