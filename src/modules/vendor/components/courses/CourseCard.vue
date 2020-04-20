<template>
  <q-card flat>
    <q-card-section class="text-weight-bold text-capitalize" @click="$emit('click', course)">
      {{ course.name }}
    </q-card-section>
  </q-card>
</template>

<script>
export default {
  name: 'CourseDetail',
  props: {
    course: { type: Object, default: () => ({}) },
  },
}
</script>

<style lang="stylus" scoped>
  .q-card__section
    font-size: 13px
    height: fit-content
    &:hover
      cursor: pointer
    &--vert
      padding: 10px
</style>
