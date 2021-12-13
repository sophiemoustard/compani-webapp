<template>
  <q-banner :class="`full-width warning q-mb-md ${backgroundClass}`" dense>
    <q-icon size="sm" :name="icon" />
    <div><slot name="message" /></div>
  </q-banner>
</template>

<script>
import { CLIENT, VENDOR } from '@data/constants';

export default {
  name: 'Banner',
  props: {
    icon: { type: String, default: 'warning' },
  },
  data () {
    const interfaceType = /\/ad\//.test(this.$router.currentRoute.path) ? VENDOR : CLIENT;
    return {
      backgroundClass: interfaceType === CLIENT ? 'bg-copper-grey-200' : 'bg-peach-200',
    };
  },
};
</script>

<style lang="sass" scoped>
.q-banner
  ::v-deep .q-banner__content
    display: flex
    align-items: center
    .q-icon
      margin-right: 4px
</style>
