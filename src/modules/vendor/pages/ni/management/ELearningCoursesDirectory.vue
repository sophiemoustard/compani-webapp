<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Formations eLearning" search-placeholder="Rechercher une formation"
      @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredCourses" :columns="columns" :loading="tableLoading" v-model:pagination="pagination"
      @go-to="goToCourseProfile" />
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { STRICTLY_E_LEARNING, OPERATIONS } from '@data/constants';
import { eLearningCourseDirectoryMixin } from '@mixins/eLearningCourseDirectoryMixin';

const metaInfo = { title: 'Repertoire formation eLearning' };

export default {
  name: 'ELearningCoursesDirectory',
  mixins: [eLearningCourseDirectoryMixin, createMetaMixin(metaInfo)],
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
  },
  async created () {
    await this.refreshCourseList({ format: STRICTLY_E_LEARNING, action: OPERATIONS });
  },
  methods: {
    goToCourseProfile (row) {
      this.$router.push({ name: 'ni management elearning courses info', params: { courseId: row._id } });
    },
  },
};
</script>
