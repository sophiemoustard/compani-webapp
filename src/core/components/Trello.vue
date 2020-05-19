<template>
  <div class="trello">
    <course-container v-for="col in trello" :title="col.title" :courses="col.courses" :key="col.title" />
  </div>
</template>

<script>
import CourseContainer from 'src/modules/vendor/components/courses/CourseContainer';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'Trello',
  components: {
    'course-container': CourseContainer,
  },
  mixins: [courseMixin],
  props: {
    courses: { type: Array, default: () => [] },
  },
}
</script>

<style lang="stylus" scoped>
.trello
  overflow: auto;
  display: flex
  flex-direction: row
  @media screen and (min-width: 768px)
    justify-content: space-between
</style>
