<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Formations" class="q-mb-xl" />
    <ni-trello :courses="coursesWithGroupedSlot" />
  </q-page>
</template>

<script>
import { required, requiredIf } from 'vuelidate/lib/validators';
import { mapState } from 'vuex';
import groupBy from 'lodash/groupBy';
import Courses from '@api/Courses';
import TitleHeader from '@components/TitleHeader';
import Trello from '@components/Trello';
import { INTRA, COURSE_TYPES } from '@data/constants';
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
      modalLoading: false,
      newCourse: {
        program: '',
        company: '',
        name: '',
        type: INTRA,
      },
      courseCreationModal: false,
      coursesWithGroupedSlot: [],
      programOptions: [],
      companyOptions: [],
      courseTypes: COURSE_TYPES,
    }
  },
  validations () {
    return {
      newCourse: {
        program: { required },
        company: { required: requiredIf((item) => { return item.type === INTRA; }) },
        name: { required },
        type: { required },
      },
    }
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    isIntraCourse () {
      return this.newCourse.type === INTRA;
    },
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
