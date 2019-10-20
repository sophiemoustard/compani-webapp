<template>
  <div class="row">
    <div :class="['col-xs-12', { 'col-md-5': displayToggle }, { 'col-md-6': !displayToggle }]">
      <h4 class="no-margin">{{ title }}</h4>
    </div>
    <div :class="['col-xs-12', { 'col-md-5': displayToggle }, { 'col-md-6': !displayToggle }]">
      <ni-input class="no-border" :value="search" :placeholder="searchPlaceholder"
        @input="input" :debounce="0" icon="search" type="search" />
    </div>
    <div v-if="displayToggle" class="col-xs-12 col-md-2 row justify-end">
      <q-toggle :value="toggleValue" color="primary" :label="toggleLabel" @input="toggle" />
    </div>
  </div>
</template>

<script>
import Input from './form/Input';

export default {
  name: 'DirectoryHeader',
  props: {
    title: { type: String, default: '' },
    searchPlaceholder: { type: String, default: 'Rechercher un profil' },
    toggleLabel: { type: String, default: '' },
    toggleValue: { type: Boolean, default: false },
    displayToggle: { type: Boolean, default: false },
    search: { type: String, default: '' },
  },
  components: {
    'ni-input': Input,
  },
  methods: {
    input (value) {
      this.$emit('updateSearch', value);
    },
    toggle (value) {
      this.$emit('toggle', value);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .q-option
    font-size: 14px
</style>
