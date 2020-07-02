<template>
  <q-banner :class="`full-width warning q-mb-md ${backgroundClass}`" dense>
    <slot name="icon"><q-icon size="sm" name="warning" /></slot>
    <div><slot name="message" /></div>
  </q-banner>
</template>

<script>
import { CLIENT, VENDOR } from '@data/constants';

export default {
  name: 'Banner',
  props: {
    icon: { type: String, default: 'icon' },
  },
  data () {
    const interfaceType = /\/ad\//.test(this.$router.currentRoute.path) ? VENDOR : CLIENT;
    return {
      backgroundClass: interfaceType === CLIENT ? 'grey-background' : 'beige-background',
    }
  },
}
</script>

<style lang="stylus" scoped>
.q-banner
  /deep/ .q-banner__content
    display: flex;
    align-items: center
    .q-icon
      margin-right: 5px
</style>
