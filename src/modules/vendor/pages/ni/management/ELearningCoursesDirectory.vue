<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Formations eLearning" search-placeholder="Rechercher une formation"
      @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredCourses" :columns="columns" :loading="tableLoading" :pagination.sync="pagination" />
  </q-page>
</template>

<script>
import escapeRegExp from 'lodash/escapeRegExp';
import Courses from '@api/Courses';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { NotifyNegative } from '@components/popup/notify';
import { removeDiacritics } from '@helpers/utils';
import { STRICTLY_E_LEARNING } from '@data/constants';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'ELearningCoursesDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
  },
  data () {
    return {
      tableLoading: false,
      columns: [
        { name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true },
      ],
      courses: [],
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 },
      searchStr: '',
    };
  },
  computed: {
    filteredCourses () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.courses.filter(course => course.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    },
  },
  async created () {
    await this.refreshCourse();
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    async refreshCourse () {
      try {
        this.tableLoading = true;
        const courseList = await Courses.list({ format: STRICTLY_E_LEARNING });

        this.courses = courseList.map(c => ({ name: c.misc, noDiacriticsName: 'wip' })); // WIIIIP
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des formations.');
      } finally {
        this.tableLoading = false;
      }
    },
  },
};
</script>
