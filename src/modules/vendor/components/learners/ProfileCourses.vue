<template>
  <div class="q-mb-xl">
    <p class="text-weight-bold">Formations suivies</p>
    <q-card v-for="(course, index) of orderedCourses" :key="index" flat class="q-mb-sm">
      <q-card-section class="row">
        <q-item-section class="col-8 head">{{ course.title }}</q-item-section>
        <q-item-section class="col-2">{{ course.status }}</q-item-section>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import { FORTHCOMING, IN_PROGRESS, COMPLETED } from '@data/constants';
import { userMixin } from '@mixins/userMixin';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';
import { courseTimelineMixin } from '@mixins/courseTimeline';

export default {
  name: 'ProfileCourses',
  mixins: [userMixin, courseTimelineMixin, courseFiltersMixin],
  data () {
    return {
      courses: [],
      statusTranslation: [
        { status: FORTHCOMING, label: 'À venir' },
        { status: IN_PROGRESS, label: 'En cours' },
        { status: COMPLETED, label: 'Terminée' },
      ],
    };
  },
  computed: {
    ...mapState('userProfile', ['userProfile']),
    orderedCourses () {
      return [...this.courseListForthcoming, ...this.courseListInProgress, ...this.courseListCompleted]
        .map(course => { return this.formatRowDisplay(course) })
    },
  },
  async created () {
    this.courses = await Courses.list({ trainees: this.userProfile._id });
    this.courses = this.groupByCourses(this.courses);
  },
  methods: {
    formatCourseName (course) {
      const possiblyMisc = course.misc ? ` - ${course.misc}` : '';
      return course.program.name + possiblyMisc;
    },
    formatRowDisplay (course) {
      const possiblyMisc = course.misc ? ` - ${course.misc}` : '';

      return {
        title: course.program.name + possiblyMisc,
        status: this.statusTranslation.find(t => t.status === course.status).label,
      }
    },
  },
};
</script>

<style lang="stylus" scoped>

.head
  margin-right: 8%

.q-card
  border-radius: 0px

</style>
