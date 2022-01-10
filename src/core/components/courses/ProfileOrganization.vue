<template>
  <div v-if="course">
    <div class="q-mb-xl">
      <div v-if="isClientInterface && isCourseInter" class="q-mb-xl">
        <p class="text-weight-bold">Informations pratiques</p>
        <ni-banner v-if="followUpDisabled">
          <template #message>{{ missingInfoMsg }}</template>
        </ni-banner>
        <ni-course-info-link :disable-link="disableDocDownload" @download="downloadConvocation" />
      </div>
      <div v-else class="profile-container">
        <ni-bi-color-button class="button-history" icon="history" label="Historique" @click="toggleHistory" />
        <div class="row gutter-profile">
          <ni-input caption="Informations complémentaires" v-model.trim="course.misc"
            @blur="updateCourse('misc')" @focus="saveTmp('misc')" :disable="isArchived" />
          <ni-select v-if="!isClientInterface" v-model.trim="course.salesRepresentative._id"
            @blur="updateCourse('salesRepresentative')" caption="Référent(e) Compani" :disable="!isAdmin || isArchived"
            :options="salesRepresentativeOptions" @focus="saveTmp('salesRepresentative')"
            :error="v$.course.salesRepresentative._id.$error" />
          <ni-select v-if="isAdmin" v-model.trim="course.trainer._id" @focus="saveTmp('trainer')"
            caption="Intervenant(e)" :options="trainerOptions" :error="v$.course.trainer._id.$error"
            @blur="updateCourse('trainer')" :disable="isArchived" />
        </div>
      </div>
    </div>
    <ni-slot-container :can-edit="canEditSlots" :loading="courseLoading" @refresh="refreshCourse" />
    <ni-trainee-table :can-edit="canEditTrainees" :loading="courseLoading" @refresh="refreshCourse" />
    <q-page-sticky expand position="right">
      <course-history-feed v-if="displayHistory" @toggle-history="toggleHistory" :course-histories="courseHistories"
        @load="updateCourseHistories" ref="courseHistoryFeed" />
    </q-page-sticky>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import Users from '@api/Users';
import CourseHistories from '@api/CourseHistories';
import Roles from '@api/Roles';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import SlotContainer from '@components/courses/SlotContainer';
import TraineeTable from '@components/courses/TraineeTable';
import CourseInfoLink from '@components/courses/CourseInfoLink';
import CourseHistoryFeed from '@components/courses/CourseHistoryFeed';
import Banner from '@components/Banner';
import { NotifyNegative } from '@components/popup/notify';
import { INTER_B2B, VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER, TRAINER } from '@data/constants';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { userMixin } from '@mixins/userMixin';
import { courseMixin } from '@mixins/courseMixin';
import BiColorButton from '@components/BiColorButton';

export default {
  name: 'ProfileOrganization',
  mixins: [userMixin, courseMixin],
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-slot-container': SlotContainer,
    'ni-trainee-table': TraineeTable,
    'ni-course-info-link': CourseInfoLink,
    'ni-banner': Banner,
    'course-history-feed': CourseHistoryFeed,
    'ni-bi-color-button': BiColorButton,
  },
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    const isClientInterface = !/\/ad\//.test(this.$route.path);

    return {
      trainerOptions: [],
      salesRepresentativeOptions: [],
      courseLoading: false,
      courseSlotsLoading: false,
      tmpInput: '',
      isClientInterface,
      displayHistory: false,
      courseHistories: [],
    };
  },
  validations () {
    return {
      course: {
        trainer: { _id: { required }, identity: { required } },
        salesRepresentative: { _id: { required }, identity: { required } },
      },
    };
  },
  computed: {
    ...mapState('course', ['course']),
    isTrainer () {
      return this.vendorRole === TRAINER;
    },
    isAdmin () {
      return [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(this.vendorRole);
    },
    isCourseInter () {
      return this.course.type === INTER_B2B;
    },
    canEditSlots () {
      return !(this.isClientInterface && this.isCourseInter);
    },
    canEditTrainees () {
      return this.isIntraCourse || (!this.isClientInterface && !this.isTrainer);
    },
    missingInfoMsg () {
      return `Le lien vers la page sera disponible dès que l'équipe aura rentré ${
        this.followUpMissingInfo.length > 1 ? 'les informations manquantes : ' : 'l\'information manquante : '
      }${this.followUpMissingInfo.join(', ')}`;
    },
  },
  async created () {
    if (!this.course) await this.refreshCourse();

    if (this.isAdmin) await this.refreshTrainersAndSalesRepresentatives();
    else this.salesRepresentativeOptions = formatAndSortIdentityOptions([this.course.salesRepresentative]);
  },
  methods: {
    get,
    async toggleHistory () {
      this.displayHistory = !this.displayHistory;
      if (this.displayHistory) await this.getCourseHistories();
      else this.courseHistories = [];
    },
    async getCourseHistories (createdAt = null) {
      const courseHistoriesTmp = cloneDeep(this.courseHistories);
      try {
        let olderCourseHistories;
        if (createdAt) {
          olderCourseHistories = await CourseHistories.getCourseHistories({ course: this.profileId, createdAt });
          this.courseHistories.push(...olderCourseHistories);
        } else {
          olderCourseHistories = await CourseHistories.getCourseHistories({ course: this.profileId });
          this.courseHistories = olderCourseHistories;
        }

        return olderCourseHistories;
      } catch (e) {
        this.courseHistories = courseHistoriesTmp;
        console.error(e);
        NotifyNegative('Erreur lors de la récupération de l\'historique d\'activité');
      }
    },
    async updateCourseHistories (done) {
      const lastCreatedAt = this.courseHistories.length
        ? this.courseHistories[this.courseHistories.length - 1].createdAt
        : null;
      const olderCourseHistories = await this.getCourseHistories(lastCreatedAt);

      return done(!olderCourseHistories.length);
    },
    async refreshCourse () {
      try {
        this.courseLoading = true;
        await this.$store.dispatch('course/fetchCourse', { courseId: this.profileId });
        if (this.displayHistory) {
          await this.getCourseHistories();
          this.$refs.courseHistoryFeed.resumeScroll();
        }
      } catch (e) {
        console.error(e);
      } finally {
        this.courseLoading = false;
      }
    },
    async refreshTrainersAndSalesRepresentatives () {
      try {
        const vendorUsers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        this.trainerOptions = Object.freeze(formatAndSortIdentityOptions(vendorUsers));

        const [trainerRole] = await Roles.list({ name: [TRAINER] });
        const salesRepresentatives = vendorUsers.filter(t => t.role.vendor !== trainerRole._id);
        this.salesRepresentativeOptions = Object.freeze(formatAndSortIdentityOptions(salesRepresentatives));
      } catch (e) {
        console.error(e);
        this.trainerOptions = [];
        this.salesRepresentativeOptions = [];
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.profile-container
  display: flex
  flex-direction: column

.button-history
  align-self: flex-end
</style>
