<template>
  <div class="trello">
    <course-container v-for="col in trello" :title="col.title" :courses="col.courses" :key="col.title" />
  </div>
</template>

<script>
import CourseContainer from '@components/courses/CourseContainer';
import { courseTimelineMixin } from '@mixins/courseTimeline';

export default {
  name: 'Trello',
  mixins: [courseTimelineMixin],
  components: {
    'course-container': CourseContainer,
  },
  props: {
    courses: { type: Array, default: () => [] },
  },
  computed: {
    trello () {
      return [
        { title: 'À venir', courses: this.courseListForthcoming },
        { title: 'En cours', courses: this.courseListInProgress },
        { title: 'Terminées', courses: this.courseListCompleted },
      ];
    },
  },
};
</script>

<style lang="sass" scoped>
.trello
  overflow: auto
  display: flex
  flex-direction: row
  @media screen and (min-width: 768px)
    justify-content: space-between
</style>
