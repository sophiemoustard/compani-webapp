<template>
  <ni-select :in-modal="inModal" :value="value" ref="selectSector" @input="updateSector" :options="sectors" @blur="blurHandler"
    @focus="focusHandler" filter-placeholder="Rechercher" :error="error"
    :error-label="error-label"/>
</template>

<script>
import Select from './Select';
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'SelectSector',
  props: {
    value: String,
    myError: { type: String, default: null },
    inModal: { type: Boolean, default: false },
    companyId: String,
    allowNullOption: { type: Boolean, default: false },
    error: Boolean,
    errorLabel: { type: String, default: REQUIRED_LABEL },
  },
  components: {
    'ni-select': Select,
  },
  data () {
    return {
      sectors: [],
    };
  },
  async mounted () {
    await this.getSectors();
  },
  computed: {
    currentUser () {
      return this.$store.getters['main/user'];
    },
  },
  methods: {
    async getSectors () {
      try {
        const sectors = await this.$sectors.showAll({ company: this.currentUser.company._id });
        if (this.allowNullOption) sectors.push({ name: 'Toutes les équipes', _id: '' });
        this.sectors = this.$_.sortBy(sectors.map(sector => ({ label: sector.name, value: sector._id })), ['label']);
      } catch (e) {
        console.error(e);
      }
    },
    updateSector (value) {
      this.$emit('input', value);
    },
    blurHandler () {
      this.$emit('blur');
    },
    focusHandler () {
      this.$emit('focus');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .border
    border: 1px solid $light-grey
</style>
