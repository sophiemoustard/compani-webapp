<template>
  <div v-if="course">
    <div class="q-mb-xl">
      <div v-if="isClientInterface && isCourseInter" class="q-mb-xl">
        <p class="text-weight-bold">Informations pratiques</p>
        <ni-banner v-if="followUpDisabled">
          <template v-slot:message>{{ missingInfoMsg }}</template>
        </ni-banner>
        <ni-course-info-link :disable-link="followUpDisabled" />
      </div>
      <div v-else>
        <div class="button-container">
          <ni-button class="button" flat icon="history" color="primary" @click="toggleHistory" />
          <ni-button class="button" flat label="Historique" color="black" @click="toggleHistory" />
        </div>
        <div class="row gutter-profile">
          <ni-input caption="Informations complémentaires" v-model.trim="course.misc"
            @blur="updateCourse('misc')" @focus="saveTmp('misc')" />
          <ni-select v-if="isAdmin" v-model.trim="course.trainer._id" @focus="saveTmp('trainer')" caption="Intervenant"
            :options="trainerOptions" :error="$v.course.trainer.$error" @blur="updateCourse('trainer')" />
        </div>
      </div>
    </div>
    <ni-slot-container :can-edit="canEdit" :loading="courseLoading" @refresh="refreshCourse" />
    <ni-trainee-table :can-edit="canEdit" :loading="courseLoading" @refresh="refreshCourse" />
    <q-page-sticky expand position="right">
      <course-history-feed v-if="displayHistory" @toggle-history="toggleHistory" :course-histories="courseHistories" />
    </q-page-sticky>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import pick from 'lodash/pick';
import Users from '@api/Users';
import CourseHistories from '@api/CourseHistories';
import Input from '@components/form/Input';
import Button from '@components/Button';
import Select from '@components/form/Select';
import SlotContainer from '@components/courses/SlotContainer';
import TraineeTable from '@components/courses/TraineeTable';
import CourseInfoLink from '@components/courses/CourseInfoLink';
import CourseHistoryFeed from '@components/courses/CourseHistoryFeed';
import Banner from '@components/Banner';
import { NotifyNegative } from '@components/popup/notify';
import {
  INTER_B2B,
  VENDOR_ADMIN,
  TRAINING_ORGANISATION_MANAGER,
  TRAINER,
} from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import { userMixin } from '@mixins/userMixin';
import { courseMixin } from '@mixins/courseMixin';

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
    'ni-button': Button,
    'course-history-feed': CourseHistoryFeed,
  },
  data () {
    const isClientInterface = !/\/ad\//.test(this.$router.currentRoute.path);

    return {
      trainerOptions: [],
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
        trainer: { required },
      },
      newTrainee: this.traineeValidations,
      editedTrainee: pick(this.traineeValidations, ['identity', 'contact']),
    };
  },
  computed: {
    ...mapState('course', ['course']),
    isAdmin () {
      return [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(this.vendorRole);
    },
    isCourseInter () {
      return this.course.type === INTER_B2B;
    },
    canEdit () {
      return !(this.isClientInterface && this.isCourseInter);
    },
    missingInfoMsg () {
      return `Le lien vers la page sera disponible dès que l'équipe aura rentré ${
        this.followUpMissingInfo.length > 1 ? 'les informations manquantes : ' : 'l\'information manquante : '
      }${this.followUpMissingInfo.join(', ')}`;
    },
  },
  async created () {
    if (!this.course) await this.refreshCourse();
    if (this.isAdmin) await this.refreshTrainers();
  },
  methods: {
    get,
    async toggleHistory () {
      this.displayHistory = !this.displayHistory;
      if (this.displayHistory) await this.getCourseHistories();
      else this.courseHistories = [];
    },
    async getCourseHistories () {
      try {
        this.courseHistories = await CourseHistories.getCourseHistories({ course: this.profileId });
      } catch (e) {
        this.courseHistories = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération de l\'historique d\'activité');
      }
    },
    async refreshCourse () {
      try {
        this.courseLoading = true;
        await this.$store.dispatch('course/fetchCourse', { courseId: this.profileId });
      } catch (e) {
        console.error(e);
      } finally {
        this.courseLoading = false;
      }
    },
    async refreshTrainers () {
      try {
        const trainers = await Users.list({ role: [TRAINER, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });
        this.trainerOptions = trainers.map(t => ({ label: formatIdentity(t.identity, 'FL'), value: t._id }));
      } catch (e) {
        console.error(e);
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
    .button-container
      text-align: end
    .button
      margin: -4px
</style>
