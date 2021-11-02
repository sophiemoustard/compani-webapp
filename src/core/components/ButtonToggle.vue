<template>
  <q-btn-toggle :class="displayClass" no-wrap :value="value" unelevated :toggle-color="toggleColor" :options="options"
    @input="input" :text-color="textColor" />
</template>

<script>
export default {
  name: 'ButtonToggle',
  props: {
    toggleColor: { type: String, default: 'primary' },
    textColor: { type: String, default: 'copper-grey-700' },
    value: { type: String, default: '' },
    displayClass: { type: String, default: '' },
    options: { type: Array, default: () => [] },
  },
  methods: {
    input (event) {
      this.$emit('input', event);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .q-btn-toggle
    width: 100%
    display: flex
    @media screen and (max-width: 767px)
      display: grid;
      grid-template-columns: repeat(2, 1fr);
    >>> .q-btn-item
      flex-grow: 1
      flex-basis: 0
      border-radius: 20px
      margin: 4px
      padding: 0 4px
      background-color: $copper-grey-300
      > .q-btn__wrapper
        padding: 0

</style>
