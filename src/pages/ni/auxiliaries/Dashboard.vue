<template>
  <q-page class="neutral-background">
    <div class="title-padding row items-start">
      <div class="col-xs-12 col-md-5 row">
        <ni-chips-autocomplete ref="teamAutocomplete" v-model="terms" :filters="filters" />
      </div>
      <div class="col-xs-12 col-md-7 row justify-end">
        <ni-select v-model="month" :options="monthsOptions" />
      </div>
    </div>
  </q-page>
</template>

<script>
import { mapActions, mapGetters } from 'vuex';
import Select from '../../../components/form/Select';
import ChipsAutocomplete from '../../../components/planning/ChipsAutocomplete';
import { AUXILIARY_ROLES } from '../../../data/constants';

export default {
  name: 'Dashboard',
  metaInfo: { title: 'Tableau de bord' },
  components: {
    'ni-select': Select,
    'ni-chips-autocomplete': ChipsAutocomplete,
  },
  data () {
    return {
      month: this.$moment().format('MMYY'),
      terms: [],
      filteredSectors: [],
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
        return [{ label: this.$moment().format('MMMM YY'), value: this.$moment().format('MMYY') }];
      }

      const range = Array.from(this.$moment().range(companyCreationDate, this.$moment().add(1, 'M')).by('month'))
        .sort((a, b) => b.diff(a));
      return range.map(month => ({ label: month.format('MMMM YY'), value: month.format('MMYY') }));
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
    // Filter
    async addElementToFilter (el) {
      this.filteredSectors.push(el._id);
    },
    async removeElementFromFilter (el) {
      this.filteredSectors = this.filteredSectors.filter(sec => sec !== el._id);
    },
  },
}
</script>
