<template>
  <div class="elearning-indicator text-weight-bold text-pink-500">{{ indicator }}</div>
</template>

<script>
export default {
  name: 'ELearningIndicator',
  props: {
    indicator: { type: Number, default: 0 },
  },
};
</script>

<style lang="stylus" scoped>
.elearning-indicator
  font-size: 36px
</style>
