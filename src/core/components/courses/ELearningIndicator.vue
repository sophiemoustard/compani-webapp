<template>
  <div class="elearning-indicator text-weight-bold text-copper-500">{{ indicator }}</div>
</template>

<script>
export default {
  name: 'ELearningIndicator',
  props: {
    indicator: { type: Number, default: 0 },
  },
};
</script>

<style lang="sass" scoped>
.elearning-indicator
  font-size: 36px
</style>
