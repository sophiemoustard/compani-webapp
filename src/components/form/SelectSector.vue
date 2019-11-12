<template>
  <ni-select :in-modal="inModal" :value="value" ref="selectSector" @input="updateSector" :options="sectors"
    @blur="blurHandler" @focus="focusHandler" filter-placeholder="Rechercher" :error="error" :error-label="errorLabel"
    :in-form="inForm" />
</template>

<script>
import Select from './Select';
import { REQUIRED_LABEL } from '../../data/constants';

export default {
  name: 'SelectSector',
  props: {
    value: { type: String, default: '' },
    myError: { type: String, default: null },
    inModal: { type: Boolean, default: false },
    inForm: { type: Boolean, default: false },
    companyId: { type: String, default: '' },
    allowNullOption: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
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
        const sectors = await this.$sectors.list();
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
