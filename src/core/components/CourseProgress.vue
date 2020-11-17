<template>
  <q-linear-progress class="linear-progress" size="8px" :value="value" color="primary" />
</template>

<script>
export default {
  name: 'CourseProgress',
  props: {
    value: { type: Number, default: 0 },
  },
};
</script>

<style lang="stylus" scoped>
.linear-progress
  border-radius: 100px
  background-color: $primary-light
</style>
