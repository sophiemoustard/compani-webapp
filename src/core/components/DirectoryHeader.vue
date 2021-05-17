<template>
  <div class="row q-mb-md">
    <div :class="['col-xs-12 col-md-6', { 'q-mb-sm': $q.platform.is.mobile }]">
      <h4 class="no-margin">{{ title }}</h4>
    </div>
    <div class="col-xs-12 col-md-6">
      <q-input class="no-border" :value="search" :placeholder="searchPlaceholder" dense borderless
        @input="input" debounce="0" type="search" bg-color="white">
        <template #prepend>
          <q-icon size="xs" name="search" />
        </template>
      </q-input>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DirectoryHeader',
  props: {
    title: { type: String, default: '' },
    searchPlaceholder: { type: String, default: 'Rechercher un profil' },
    search: { type: String, default: '' },
  },
  methods: {
    input (value) {
      this.$emit('update-search', value);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .q-option
    font-size: 14px;
  .q-input
    /deep/ .q-field__control
      font-size: 14px
</style>
