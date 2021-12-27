<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Formations eLearning" search-placeholder="Rechercher une formation"
      @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredCourses" :columns="columns" :loading="tableLoading" v-model:pagination="pagination"
      @go-to="goToCourseProfile" />
  </q-page>
</template>

<script>
import Courses from '@api/Courses';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { NotifyNegative } from '@components/popup/notify';
import { STRICTLY_E_LEARNING } from '@data/constants';
import { removeDiacritics } from '@helpers/utils';
import { eLearningCourseDirectoryMixin } from '@mixins/eLearningCourseDirectoryMixin';

export default {
  metaInfo: { title: 'Repertoire formation eLearning' },
  name: 'ELearningCoursesDirectory',
  mixins: [eLearningCourseDirectoryMixin],
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
  },
  async created () {
    await this.refreshCourse();
  },
  methods: {
    async refreshCourse () {
      try {
        this.tableLoading = true;
        const courseList = await Courses.list({ format: STRICTLY_E_LEARNING });

        this.courses = courseList.map(c => ({
          name: c.subProgram.program.name,
          noDiacriticsName: removeDiacritics(c.subProgram.program.name),
          createdAt: c.createdAt,
          _id: c._id,
          traineesCount: c.trainees.length || '0',
        }));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des formations.');
      } finally {
        this.tableLoading = false;
      }
    },
    goToCourseProfile (row) {
      this.$router.push({ name: 'ni management elearning courses info', params: { courseId: row._id } });
    },
  },
};
</script>
