<template>
  <div class="indicator text-weight-bold text-copper-500">{{ indicator }}</div>
</template>

<script>
export default {
  name: 'Indicator',
  props: {
    indicator: { type: Number, default: 0 },
  },
};
</script>

<style lang="sass" scoped>
.indicator
  font-size: 36px
</style>
