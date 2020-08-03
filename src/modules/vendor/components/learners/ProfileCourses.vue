<template>
  <div class="q-mb-xl">
    <p class="text-weight-bold">Formations suivies</p>
    <q-card v-for="(course, index) of courses" :key="index" flat class="q-mb-sm">
      <q-card-section class="row" @click="showActivities(step._id)">
        <q-item-section class="col-8 head">{{ formatCourseName(course) }}</q-item-section>
        <q-item-section class="col-2">{{ course.type }}</q-item-section>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import { userMixin } from '@mixins/userMixin';

export default {
  name: 'ProfileCourses',
  mixins: [userMixin],
  data () {
    return {
      courses: [],
    };
  },
  computed: {
    ...mapState('userProfile', ['userProfile']),
  },
  async created () {
    this.courses = await Courses.list({ trainees: this.userProfile._id });
  },
  methods: {
    formatCourseName (course) {
      const possiblyMisc = course.misc ? ` - ${course.misc}` : '';
      return course.program.name + possiblyMisc;
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
