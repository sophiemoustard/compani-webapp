<template>
  <div v-if="course">
    <div class="q-mb-xl">
      <div v-if="isClientInterface && isCourseInter" class="q-mb-xl">
        <p class="text-weight-bold">Informations pratiques</p>
        <ni-banner v-if="disabledFollowUp">
          <template v-slot:message>
            Le lien vers la page sera disponible dès que l'équipe aura rentré la ou les information(s) suivante(s) :
            {{ followUpMissingInfo.join(', ') }}.
          </template>
        </ni-banner>
        <ni-course-info-link :disable-link="disabledFollowUp" />
      </div>
      <div v-else class="row gutter-profile">
        <ni-input caption="Informations complémentaires" v-model.trim="course.misc"
          @blur="updateCourse('misc')" @focus="saveTmp('misc')" />
        <ni-select v-if="isAdmin" v-model.trim="course.trainer._id" @focus="saveTmp('trainer')" caption="Intervenant"
          :options="trainerOptions" :error="$v.course.trainer.$error" @blur="updateCourse('trainer')" />
      </div>
    </div>
    <ni-slot-container :canEdit="canEdit" :loading="courseLoading" @refresh="refreshCourse" />
    <ni-trainee-table :canEdit="canEdit" :loading="courseLoading" @refresh="refreshCourse" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import pick from 'lodash/pick';
import Users from '@api/Users';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import SlotContainer from '@components/courses/SlotContainer';
import TraineeTable from '@components/courses/TraineeTable';
import Banner from '@components/Banner';
import CourseInfoLink from './CourseInfoLink';
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
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-slot-container': SlotContainer,
    'ni-trainee-table': TraineeTable,
    'ni-course-info-link': CourseInfoLink,
    'ni-banner': Banner,
  },
  data () {
    const isClientInterface = !/\/ad\//.test(this.$router.currentRoute.path);

    return {
      trainerOptions: [],
      courseLoading: false,
      courseSlotsLoading: false,
      tmpInput: '',
      isClientInterface,
    }
  },
  validations () {
    return {
      course: {
        trainer: { required },
      },
      newTrainee: this.traineeValidations,
      editedTrainee: pick(this.traineeValidations, ['identity', 'contact']),
    }
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
  },
  async created () {
    if (!this.course) await this.refreshCourse();
    if (this.isAdmin) await this.refreshTrainers();
  },
  methods: {
    get,
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
        this.trainerOptions = trainers.map(t => ({ label: formatIdentity(t.identity, 'FL'), value: t._id }))
      } catch (e) {
        console.error(e);
      }
    },
  },
}
</script>
