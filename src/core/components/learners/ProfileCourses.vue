<template>
  <div class="q-mb-xl">
    <p class="text-weight-bold q-mb-none">Formations suivies</p>
    <ni-table-list :data="courses" :columns="columns" @go-to="goToBlendedCourseProfileAdmin"
      :pagination.sync="pagination" :disabled="!isVendorInterface">
      <template #body="{ col }">
        <q-item v-if="col.name === 'progress'">
          <ni-progress :value="col.value" />
        </q-item>
      </template>
    </ni-table-list>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import Courses from '@api/Courses';
import TableList from '@components/table/TableList';
import { BLENDED } from '@data/constants';
import { sortStrings } from '@helpers/utils';
import Progress from '@components/CourseProgress';

export default {
  name: 'ProfileCourses',
  components: {
    'ni-table-list': TableList,
    'ni-progress': Progress,
  },
  data () {
    return {
      isVendorInterface: /\/ad\//.test(this.$router.currentRoute.path),
      courses: [],
      pagination: {
        sortBy: 'name',
        descending: false,
        page: 1,
        rowsPerPage: 15,
      },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row,
          align: 'left',
          sortable: true,
          format: value => (get(value, 'subProgram.program.name') || '') + (value.misc ? ` - ${value.misc}` : ''),
          sort: (a, b) => sortStrings(get(a, 'subProgram.program.name') || '', get(b, 'subProgram.program.name') || ''),
          style: 'min-width: 200px; width: 65%',
        },
        {
          name: 'type',
          label: 'Type',
          field: 'format',
          align: 'left',
          sortable: true,
          format: value => ((value === BLENDED) ? 'Formation mixte' : 'Formation eLearning'),
          sort: (a, b) => sortStrings(a, b),
          style: 'min-width: 110px; width: 35%',
        },
        {
          name: 'progress',
          label: 'Progression',
          field: 'progress',
          align: 'center',
          sortable: true,
          style: 'min-width: 110px; width: 35%',
        },
      ],
    };
  },
  computed: {
    ...mapState('userProfile', ['userProfile']),
  },
  async created () {
    try {
      this.courses = await Courses.listUserCourse({ traineeId: this.userProfile._id });
    } catch (e) {
      console.error(e);
      this.courses = [];
    }
  },
  methods: {
    goToBlendedCourseProfileAdmin (row) {
      if (!this.isVendorInterface) return;
      this.$router.push({
        name: 'ni management blended courses info',
        params: { courseId: row._id, defaultTab: 'admin' },
      });
    },
  },
};
</script>
