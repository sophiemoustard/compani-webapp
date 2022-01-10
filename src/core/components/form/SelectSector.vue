<template>
  <ni-select :in-modal="inModal" :model-value="modelValue" @update:model-value="updateSector" :options="sectors"
    @blur="blurHandler" @focus="focusHandler" filter-placeholder="Rechercher" :error="error" ref="selectSector"
    caption="Équipe" :required-field="requiredField" :error-message="errorMessage" />
</template>

<script>
import sortBy from 'lodash/sortBy';
import Sectors from '@api/Sectors';
import Select from '@components/form/Select';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'SelectSector',
  props: {
    modelValue: { type: String, default: '' },
    myError: { type: String, default: null },
    inModal: { type: Boolean, default: false },
    companyId: { type: String, default: '' },
    allowNullOption: { type: Boolean, default: false },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: REQUIRED_LABEL },
    requiredField: { type: Boolean, default: false },
  },
  components: {
    'ni-select': Select,
  },
  emits: ['update:model-value', 'blur', 'focus'],
  data () {
    return {
      sectors: [],
    };
  },
  async mounted () {
    await this.getSectors();
  },
  methods: {
    async getSectors () {
      try {
        const sectors = await Sectors.list();
        if (this.allowNullOption) sectors.push({ name: 'Toutes les équipes', _id: '' });
        this.sectors = sortBy(sectors.map(sector => ({ label: sector.name, value: sector._id })), ['label']);
      } catch (e) {
        console.error(e);
      }
    },
    updateSector (value) {
      this.$emit('update:model-value', value);
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
