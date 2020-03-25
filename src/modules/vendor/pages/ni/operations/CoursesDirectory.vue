<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Formations" search-placeholder="Rechercher une formation"
      @updateSearch="updateSearch" :search="searchStr" />
    <div class="q-mt-xl">
      <course-detail class="q-mb-sm" v-for="(course, index) in filteredCourses" :key="index" :course="course"
        @click="goToCourseProfile" />
    </div>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une formation"
      @click="courseCreationModal = true" />

    <!-- Course creation modal -->
    <ni-modal v-model="courseCreationModal" @hide="resetCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">formation</span>
      </template>
      <ni-input in-modal v-model.trim="newCourse.name" :error="$v.newCourse.name.$error"
        @blur="$v.newCourse.name.$touch" required-field caption="Nom" />
      <ni-select in-modal v-model.trim="newCourse.program" :error="$v.newCourse.program.$error"
        @blur="$v.newCourse.program.$touch" required-field caption="Programme" :options="programOptions" />
      <ni-select in-modal v-model.trim="newCourse.companies" :error="$v.newCourse.companies.$error"
        @blur="$v.newCourse.companies.$touch" required-field caption="Structure" :options="companyOptions" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la formation" color="primary" :loading="modalLoading"
          icon-right="add" @click="createCourse" :disable="$v.newCourse.$invalid" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import Courses from '@api/Courses';
import Companies from '@api/Companies';
import Programs from '@api/Programs';
import DirectoryHeader from '@components/DirectoryHeader';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import CourseDetail from 'src/modules/vendor/components/courses/CourseDetail';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'CoursesDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-input': Input,
    'ni-select': Select,
    'ni-modal': Modal,
    'course-detail': CourseDetail,
  },
  data () {
    return {
      searchStr: '',
      modalLoading: false,
      newCourse: {
        program: '',
        companies: '',
        name: '',
        type: 'intra',
      },
      courseCreationModal: false,
      courses: [],
      programOptions: [],
      companyOptions: [],
    }
  },
  validations () {
    return {
      newCourse: {
        program: { required: true },
        companies: { required: true },
        name: { required: true },
        type: { required: true },
      },
    }
  },
  computed: {
    filteredCourses () {
      return this.courses
        .filter(course => course.name.match(new RegExp(this.searchStr, 'i')))
        .sort((a, b) => a.name.localeCompare(b.name));
    },
  },
  async mounted () {
    await this.refreshCourses();
    await this.refreshPrograms();
    await this.refreshCompanies();
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    goToCourseProfile (course) {
      this.$router.push({ name: 'profile course info', params: { courseId: course._id } });
    },
    async refreshCourses () {
      try {
        this.courses = await Courses.list();
      } catch (e) {
        console.error(e);
        this.courses = [];
      }
    },
    async refreshPrograms () {
      try {
        const programs = await Programs.list();
        this.programOptions = programs.map(p => ({ label: p.name, value: p._id }));
      } catch (e) {
        console.error(e);
        this.programOptions = [];
      }
    },
    async refreshCompanies () {
      try {
        const companies = await Companies.list();
        this.companyOptions = companies.map(c => ({ label: c.tradeName, value: c._id }));
      } catch (e) {
        console.error(e);
        this.companyOptions = [];
      }
    },
    resetCreationModal () {
      this.$v.newCourse.$reset();
      this.newCourse = { program: '', companies: '', name: '', type: 'intra' };
    },
    formatCourseCreationPayload (newCourse) {
      return { ...newCourse, companies: [newCourse.companies] };
    },
    async createCourse () {
      try {
        this.modalLoading = true;
        const payload = this.formatCourseCreationPayload(this.newCourse);
        await Courses.create(payload);

        this.courseCreationModal = false;
        NotifyPositive('Formation créée.')
        await this.refreshCourses();
      } catch (e) {
        console.error(e);
        NotifyNegative('Impossible de créer la formation.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
}
</script>
