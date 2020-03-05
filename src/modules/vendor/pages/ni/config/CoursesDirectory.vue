<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire formations" search-placeholder="Rechercher une formation"
      @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredCourses" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      :visible-columns="visibleColumns" @goTo="goToCousreProfile" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une structure"
      @click="courseCreationModal = true" />

    <!-- Course creation modal -->
    <ni-modal v-model="courseCreationModal" @hide="resetCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">formation</span>
      </template>
      <ni-input in-modal v-model.trim="newCourse.name" :error="$v.newCourse.name.$error"
        @blur="$v.newCourse.name.$touch" required-field caption="Nom" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la structure" color="primary" :loading="modalLoading"
          icon-right="add" @click="createCourse" :disable="!this.newCourse.name" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Courses from '@api/Courses';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';

export default {
  metaInfo: { title: 'Répertoire formation' },
  name: 'CoursesDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'ni-modal': Modal,
    'ni-input': Input,
  },
  data () {
    return {
      tableLoading: false,
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
        },
        {
          name: 'createdAt',
          label: '',
          field: 'createdAt',
        },
      ],
      visibleColumns: ['name'],
      courses: [],
      modalLoading: false,
      courseCreationModal: false,
      newCourse: { name: '' },
      pagination: {
        sortBy: 'createdAt',
        descending: true,
        page: 1,
        rowsPerPage: 15,
      },
      searchStr: '',
    }
  },
  validations () {
    return {
      newCourse: {
        name: { required },
      },
    }
  },
  computed: {
    filteredCourses () {
      return this.courses.filter(course => course.name.match(new RegExp(this.searchStr, 'i')));
    },
  },
  async mounted () {
    await this.refreshCourses();
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    goToCousreProfile (row) {
      this.$router.push({ name: 'profile course info', params: { courseId: row._id } });
    },
    async refreshCourses () {
      try {
        this.tableLoading = true;
        this.courses = await Courses.list();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des formations');
      } finally {
        this.tableLoading = false;
      }
    },
    resetCreationModal () {
      this.$v.newCourse.$reset();
      this.newCourse = { name: '' };
    },
    async createCourse () {
      try {
        this.modalLoading = true;
        await Courses.create({ ...this.newCourse });

        this.courseCreationModal = false;
        NotifyPositive('Formation créée.')
        await this.refreshCourses();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la formation.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
}
</script>
