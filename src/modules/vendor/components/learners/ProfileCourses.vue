<template>
  <div class="q-mb-xl">
    <p class="text-weight-bold q-mb-none">Formations suivies</p>
    <ni-table-list :data="orderedCourses" :columns="columns" @goTo="goToCourseProfileFollowUp"/>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import Courses from '@api/Courses';
import TableList from '@components/table/TableList';
import { FORTHCOMING, IN_PROGRESS, COMPLETED } from '@data/constants';
import { userMixin } from '@mixins/userMixin';
import { courseFiltersMixin } from '@mixins/courseFiltersMixin';
import { courseTimelineMixin } from '@mixins/courseTimeline';

export default {
  name: 'ProfileCourses',
  components: {
    'ni-table-list': TableList,
  },
  mixins: [userMixin, courseTimelineMixin, courseFiltersMixin],
  data () {
    return {
      courses: [],
      statusTranslation: {
        [FORTHCOMING]: 'À venir',
        [IN_PROGRESS]: 'En cours',
        [COMPLETED]: 'Terminée',
      },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row,
          align: 'left',
          sortable: false,
          format: (value) => value.program.name + (value.misc ? ` - ${value.misc}` : ''),
          style: 'min-width: 200px; width: 65%',
        },
        {
          name: 'status',
          label: 'Progression',
          field: 'status',
          align: 'left',
          sortable: false,
          format: (value) => this.statusTranslation[value],
          style: 'min-width: 110px; width: 35%',
        },
      ],
    };
  },
  computed: {
    ...mapState('userProfile', ['userProfile']),
    orderedCourses () {
      return [...this.courseListForthcoming, ...this.courseListInProgress, ...this.courseListCompleted]
    },
  },
  async created () {
    const courses = await Courses.list({ trainees: this.userProfile._id });
    this.courses = this.groupByCourses(courses);
  },
  methods: {
    goToCourseProfileFollowUp (row) {
      this.$router.push({
        name: 'ni management courses info',
        params: { courseId: row._id, defaultTab: 'followUp' },
      });
    },
  },
};
</script>
