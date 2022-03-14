<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Formations eLearning" search-placeholder="Rechercher une formation"
      @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredCourses" :columns="columns" :loading="tableLoading" v-model:pagination="pagination"
      @go-to="goToELearningCourseProfile" />
  </q-page>
</template>

<script>
import { createMetaMixin } from 'quasar';
import { mapGetters } from 'vuex';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { STRICTLY_E_LEARNING } from '@data/constants';
import { eLearningCourseDirectoryMixin } from '@mixins/eLearningCourseDirectoryMixin';

const metaInfo = { title: 'Repertoire formation eLearning' };

export default {
  name: 'ELearningCoursesDirectory',
  mixins: [eLearningCourseDirectoryMixin, createMetaMixin(metaInfo)],
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
  },
  async created () {
    await this.refreshCourseList({ format: STRICTLY_E_LEARNING, company: this.company._id });
  },
  methods: {
    goToELearningCourseProfile (row) {
      return this.$router.push({ name: 'ni elearning courses info', params: { courseId: row._id } });
    },
  },
};
</script>
