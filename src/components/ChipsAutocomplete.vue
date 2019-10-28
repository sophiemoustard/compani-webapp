<template>
  <q-select dense borderless bg-color="white" multiple behavior="menu" use-chips use-input ref="refFilter" emit-value
    :value="value" :options="options" @filter="search" @input="input" @add="addEvent" @remove="removeEvent"
    input-debounce="0" :style="disable && { width: '40px'}">
    <template v-slot:prepend>
      <q-icon name="search" size="xs" />
    </template>
  </q-select>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: 'ChipsAutocomplete',
  props: {
    value: { type: Array, default: () => [] },
    disable: { type: Boolean, default: false },
    filters: { type: Array, default: () => [] },
  },
  data () {
    return {
      searchIcon: [{ icon: 'search' }],
      options: [],
    }
  },
  computed: {
    ...mapGetters({
      elementToAdd: 'planning/getElementToAdd',
    }),
  },
  methods: {
    addEvent (el) {
      this.$store.commit('planning/setElementToAdd', this.filters.find(elem => elem.value === el.value));
      this.$refs.refFilter.hidePopup();
      this.$refs.refFilter.inputValue = '';
    },
    input (el) {
      this.$emit('input', el);
    },
    removeEvent (el) {
      this.$store.commit('planning/setElementToRemove', this.filters.find(elem => elem.value === el.value[0]));
    },
    async search (terms, done) {
      try {
        const regex = new RegExp(terms, 'i');
        this.options = this.filters.filter(el => el.value.match(regex));
        done(this.options);
      } catch (e) {
        done([]);
      }
    },
    add (el) {
      this.$store.commit('planning/setElementToAdd', this.filters.find(elem => elem.value === el));
      return this.$refs.refFilter.add(el);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-select
    width: 100%
    /deep/ .q-field__control
      min-height: 38px
    /deep/ .q-field__inner
      height: auto
    /deep/ .q-field__native
      height: auto
      padding: 0
    /deep/ .q-field__append
      .q-select__dropdown-icon
        display: none
    /deep/ .q-chip
      background-color: $primary
      padding: 0 8px
      min-height: 26px
      color: white
    /deep/ .q-chip__icon
      color: white
      opacity: 1;
      margin: 0;
      padding-left: 8px;
</style>
