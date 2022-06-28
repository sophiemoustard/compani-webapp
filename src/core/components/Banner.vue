<template>
  <q-banner :class="`full-width warning q-mb-md ${customClass}`" dense>
    <q-icon size="sm" :name="icon" :color="iconColor" class="q-pr-xs" />
    <div><slot name="message" /></div>
  </q-banner>
</template>

<script>
import { CLIENT, VENDOR } from '@data/constants';

export default {
  name: 'Banner',
  props: {
    icon: { type: String, default: 'warning' },
    class: { type: String, default: '' },
    iconColor: { type: String, default: '' },
  },
  data () {
    const interfaceType = /\/ad\//.test(this.$route.path) ? VENDOR : CLIENT;
    return {
      customClass: this.class || (interfaceType === CLIENT ? 'bg-copper-grey-200' : 'bg-peach-200'),
    };
  },
};
</script>

<style lang="sass" scoped>
.q-banner
  :deep(.q-banner__content)
    display: flex
    align-items: center
    .q-icon
      margin-right: 4px
</style>
