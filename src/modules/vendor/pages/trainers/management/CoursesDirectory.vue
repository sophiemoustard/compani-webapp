<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Formations" class="q-mb-xl" />
    <ni-trello :courses="coursesWithGroupedSlot" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import groupBy from 'lodash/groupBy';
import Courses from '@api/Courses';
import TitleHeader from '@components/TitleHeader';
import Trello from '@components/Trello';
import { courseMixin } from '@mixins/courseMixin';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'CoursesDirectory',
  mixins: [courseMixin],
  components: {
    'ni-title-header': TitleHeader,
    'ni-trello': Trello,
  },
  data () {
    return {
      coursesWithGroupedSlot: [],
    }
  },
  computed: {
    ...mapState('main', ['loggedUser']),
  },
  async created () {
    await this.refreshCourses();
  },
  methods: {
    async refreshCourses () {
      try {
        const courses = await Courses.list({ trainer: this.loggedUser._id });
        this.coursesWithGroupedSlot = courses.map(course => ({
          ...course,
          slots: Object.values(groupBy(course.slots, s => this.$moment(s.startDate).format('DD/MM/YYYY'))),
        }));
      } catch (e) {
        console.error(e);
        this.coursesWithGroupedSlot = [];
      }
    },
  },
}
</script>
