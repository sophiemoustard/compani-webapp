<template>
  <q-select dense borderless bg-color="white" multiple behavior="menu" use-chips use-input ref="refFilter"
    :value="value" :options="options" @filter="search" @input="input" @add="addEvent" @remove="removeEvent"
    input-debounce="0" :style="disable && { width: '40px'}" :data-cy="dataCy" map-options>
    <template #prepend>
      <q-icon name="search" size="xs" />
    </template>
  </q-select>
</template>

<script>
import { mapState } from 'vuex';
import escapeRegExp from 'lodash/escapeRegExp';
import { removeDiacritics } from '@helpers/utils';

export default {
  name: 'ChipsAutocomplete',
  props: {
    value: { type: Array, default: () => [] },
    disable: { type: Boolean, default: false },
    filters: { type: Array, default: () => [] },
    dataCy: { type: String, default: '' },
  },
  data () {
    return {
      searchIcon: [{ icon: 'search' }],
      options: [],
    };
  },
  computed: {
    ...mapState('planning', ['elementToAdd']),
    noDiacriticFilters () {
      return this.filters.map(el => ({ ...el, noDiacriticsLabel: removeDiacritics(el.label) }));
    },
  },
  methods: {
    addEvent (el) {
      this.$store.dispatch('planning/setElementToAdd', this.filters.find(elem => elem.value === el.value.value));
      this.$refs.refFilter.hidePopup();
      this.$refs.refFilter.inputValue = '';
    },
    input (list) {
      this.$emit('input', list);
    },
    removeEvent (el) {
      this.$store.dispatch('planning/setElementToRemove', this.filters.find(elem => elem.value === el.value.value));
    },
    search (terms, done) {
      const formattedString = escapeRegExp(removeDiacritics(terms));
      this.options = this.noDiacriticFilters
        .filter(el => el.noDiacriticsLabel.match(new RegExp(formattedString, 'i')));
      done(this.options);
    },
    add (el) {
      this.$store.dispatch('planning/setElementToAdd', this.filters.find(elem => elem.value === el));
      return this.$refs.refFilter.add(el);
    },
  },
};
</script>

<style lang="sass" scoped>
.q-select
  width: 100%
  ::v-deep .q-field__control
    min-height: 38px
  ::v-deep .q-field__inner
    height: auto
  ::v-deep .q-field__native
    height: auto
    padding: 0
  ::v-deep .q-field__append
    .q-select__dropdown-icon
      display: none
  ::v-deep .q-chip
    background-color: $primary
    padding: 0 8px
    min-height: 26px
    color: white
  ::v-deep .q-chip__icon
    color: white
    opacity: 1
    margin: 0
    padding-left: 8px
</style>
