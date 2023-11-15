<template>
  <div>
    <div class="q-mt-lg q-mb-xl">
      <p class="text-weight-bold">Émargements</p>
      <div v-if="isIntraOrIntraHoldingOrVendor" class="q-mb-md">
        <ni-banner v-if="followUpDisabled">
          <template #message>
            Il manque {{ formatQuantity('information', followUpMissingInfo.length ) }}
            pour assurer le suivi de la formation : {{ followUpMissingInfo.join(', ') }}.
          </template>
        </ni-banner>
        <ni-bi-color-button icon="file_download" label="Feuilles d'émargement vierges"
          :disable="disableDocDownload || isArchived" @click="downloadAttendanceSheet" size="16px" />
      </div>
      <attendance-table :course="course" />
    </div>
    <div v-if="areQuestionnaireVisible" class="q-mb-xl">
      <p class="text-weight-bold">Questionnaires</p>
      <div v-if="areQuestionnaireQRCodeVisible" class="questionnaire-link-container">
        <ni-questionnaire-qrcode-cell v-if="expectationsQuestionnaireId" :img="expectationsQRCode" :type="EXPECTATIONS"
          @click="goToQuestionnaireProfile(expectationsQuestionnaireId)" />
        <ni-questionnaire-qrcode-cell v-if="endOfCourseQuestionnaireId" :img="endOfCourseQRCode" :type="END_OF_COURSE"
          @click="goToQuestionnaireProfile(endOfCourseQuestionnaireId)" />
      </div>
      <div v-if="areQuestionnaireAnswersVisible" class="questionnaires-container">
        <questionnaire-answers-cell v-for="questionnaire in questionnaires" :key="questionnaire._id"
          :questionnaire="questionnaire" @click="goToQuestionnaireAnswers(questionnaire._id)" />
      </div>
    </div>
    <elearning-follow-up-table v-if="courseHasElearningStep" :learners="learners" :loading="learnersLoading"
      class="q-mb-xl" is-blended />
    <div class="q-mb-sm">
      <p class="text-weight-bold">Attestations de formation</p>
      <ni-banner v-if="!get(this.course, 'subProgram.program.learningGoals')">
        <template #message>
          Merci de renseigner les objectifs pédagogiques du programme pour pouvoir télécharger
          les attestations de fin de formation.
        </template>
      </ni-banner>
      <ni-bi-color-button icon="file_download" label="Attestations"
        :disable="disableDownloadCompletionCertificates" @click="downloadCompletionCertificates(CUSTOM)" size="16px" />
      <ni-bi-color-button v-if="canReadCompletionCertificate" icon="file_download" class="q-my-md"
        label="Certificats de réalisation" size="16px" :disable="disableDownloadCompletionCertificates"
        @click="downloadCompletionCertificates(OFFICIAL)" />
    </div>
    <div v-if="unsubscribedAttendances.length">
      <div class="text-italic q-ma-xs">
        Certains stagiaires inscrits à cette formation ont émargé dans d’autres formations du même programme
      </div>
      <ni-expanding-table :data="unsubscribedAttendances" :columns="columns" :pagination="pagination"
        :hide-bottom="false">
        <template #expanding-row="{ props }">
          <q-td colspan="100%">
            <div v-for="attendance in props.row.attendances" :key="attendance._id" :props="props"
              class="q-ma-sm expanding-table-expanded-row">
              <div class="dates">{{ attendance.date }}</div>
              <div class="hours">{{ attendance.hours }}</div>
              <div class="misc">{{ attendance.misc }}</div>
              <div class="trainer">{{ attendance.trainer }}</div>
            </div>
          </q-td>
        </template>
      </ni-expanding-table>
    </div>
  </div>
</template>

<script>
import { subject } from '@casl/ability';
import get from 'lodash/get';
import pick from 'lodash/pick';
import { computed, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Courses from '@api/Courses';
import Attendances from '@api/Attendances';
import Questionnaires from '@api/Questionnaires';
import { NotifyNegative } from '@components/popup/notify';
import AttendanceTable from '@components/table/AttendanceTable';
import ExpandingTable from '@components/table/ExpandingTable';
import ElearningFollowUpTable from '@components/courses/ElearningFollowUpTable';
import QuestionnaireAnswersCell from '@components/courses/QuestionnaireAnswersCell';
import BiColorButton from '@components/BiColorButton';
import Banner from '@components/Banner';
import QuestionnaireQRCodeCell from '@components/courses/QuestionnaireQRCodeCell';
import {
  E_LEARNING,
  SHORT_DURATION_H_MM,
  DD_MM_YYYY,
  END_OF_COURSE,
  EXPECTATIONS,
  PUBLISHED,
  OFFICIAL,
  CUSTOM,
} from '@data/constants';
import CompaniDuration from '@helpers/dates/companiDurations';
import CompaniDate from '@helpers/dates/companiDates';
import { getISOTotalDuration, ascendingSort } from '@helpers/dates/utils';
import { formatIdentity, formatQuantity, formatDownloadName } from '@helpers/utils';
import { composeCourseName, formatSlotSchedule } from '@helpers/courses';
import { downloadZip } from '@helpers/file';
import { defineAbilitiesForCourse } from '@helpers/ability';
import { useCourses } from '@composables/courses';
import { useTraineeFollowUp } from '@composables/traineeFollowUp';
import { ALL_PDF, ALL_WORD, TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN } from '../../data/constants';

export default {
  name: 'ProfileTraineeFollowUp',
  components: {
    'elearning-follow-up-table': ElearningFollowUpTable,
    'attendance-table': AttendanceTable,
    'ni-expanding-table': ExpandingTable,
    'questionnaire-answers-cell': QuestionnaireAnswersCell,
    'ni-bi-color-button': BiColorButton,
    'ni-banner': Banner,
    'ni-questionnaire-qrcode-cell': QuestionnaireQRCodeCell,
  },
  props: {
    profileId: { type: String, required: true },
  },
  setup (props) {
    const { profileId } = toRefs(props);
    const $store = useStore();
    const $router = useRouter();

    const questionnaires = ref([]);
    const unsubscribedAttendances = ref([]);
    const columns = ref([
      { name: 'name', label: 'Nom', field: 'trainee', align: 'left' },
      { name: 'unexpectedAttendances', label: 'Emargements imprévus', field: 'attendancesCount', align: 'center' },
      { name: 'duration', label: 'Durée', field: 'duration', align: 'center' },
      { name: 'expand', label: '', field: '' },
    ]);
    const pagination = ref({ sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 });
    const expectationsQuestionnaireId = ref();
    const endOfCourseQuestionnaireId = ref();
    const expectationsQRCode = ref('');
    const endOfCourseQRCode = ref('');

    const course = computed(() => $store.state.course.course);

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const {
      isClientInterface,
      pdfLoading,
      isIntraOrIntraHoldingOrVendor,
      isArchived,
      disableDocDownload,
      followUpDisabled,
      followUpMissingInfo,
      downloadAttendanceSheet,
      vendorRole,
    } = useCourses(course);
    const { learners, getFollowUp, learnersLoading } = useTraineeFollowUp(profileId);

    const isRofOrVendorAdmin = computed(() => [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(vendorRole.value));

    const areQuestionnaireAnswersVisible = computed(() => questionnaires.value.length);

    const areQuestionnaireQRCodeVisible = computed(() => expectationsQuestionnaireId.value ||
      endOfCourseQuestionnaireId.value);

    const areQuestionnaireVisible = computed(() => (!isClientInterface &&
      (areQuestionnaireAnswersVisible.value || areQuestionnaireQRCodeVisible.value)));

    const courseHasElearningStep = computed(() => course.value.subProgram.steps.some(step => step.type === E_LEARNING));

    const canReadCompletionCertificate = computed(() => {
      const ability = defineAbilitiesForCourse(pick(loggedUser.value, ['role']));

      return ability.can('read', subject('Course', course.value), 'certificates');
    });

    const disableDownloadCompletionCertificates =
      computed(() => disableDocDownload.value || !get(course.value, 'subProgram.program.learningGoals'));

    const refreshQuestionnaires = async () => {
      try {
        questionnaires.value = await Courses.getCourseQuestionnaires(course.value._id);
      } catch (e) {
        console.error(e);
        questionnaires.value = [];
        NotifyNegative('Erreur lors de la récupération des questionnaires.');
      }
    };

    const goToQuestionnaireAnswers = questionnaireId => $router.push(
      { name: 'ni management questionnaire answers', params: { courseId: course.value._id, questionnaireId } }
    );

    const formatTraineeAttendances = (attendancesGroupedByTrainee, traineeId) => ({
      _id: traineeId,
      trainee: formatIdentity(attendancesGroupedByTrainee[traineeId][0].trainee.identity, 'FL'),
      attendancesCount: attendancesGroupedByTrainee[traineeId].length,
      duration: CompaniDuration(getISOTotalDuration(attendancesGroupedByTrainee[traineeId].map(a => a.courseSlot)))
        .format(SHORT_DURATION_H_MM),
      attendances: [...attendancesGroupedByTrainee[traineeId]]
        .sort((a, b) => ascendingSort(a.courseSlot.startDate, b.courseSlot.startDate))
        .map(a => ({
          _id: a._id,
          date: CompaniDate(a.courseSlot.startDate).format(DD_MM_YYYY),
          hours: formatSlotSchedule(a.courseSlot),
          trainer: formatIdentity(get(a, 'trainer.identity'), 'FL'),
          misc: a.misc,
        })),
    });

    const getUnsubscribedAttendances = async () => {
      try {
        const loggedUserHolding = get(loggedUser.value, 'holding._id');
        const query = {
          course: course.value._id,
          ...(isClientInterface && {
            ...loggedUserHolding ? { holding: loggedUserHolding } : { company: loggedUser.value.company._id },
          }),
        };
        const unsubscribedAttendancesGroupedByTrainees = await Attendances.listUnsubscribed(query);
        unsubscribedAttendances.value = Object.keys(unsubscribedAttendancesGroupedByTrainees)
          .map(traineeId => formatTraineeAttendances(unsubscribedAttendancesGroupedByTrainees, traineeId));
      } catch (e) {
        console.error(e);
        unsubscribedAttendances.value = [];
        NotifyNegative('Erreur lors de la récupération des émargements annexes.');
      }
    };

    const downloadCompletionCertificates = async (type) => {
      if (disableDownloadCompletionCertificates.value) return;

      try {
        pdfLoading.value = true;
        const docType = type === OFFICIAL ? 'certificats' : 'attestations';
        const formattedName = formatDownloadName(`${docType} ${composeCourseName(course.value, true)}`);
        const zipName = `${formattedName}.zip`;

        const format = (isClientInterface || !isRofOrVendorAdmin.value) ? ALL_PDF : ALL_WORD;
        const zip = await Courses.downloadCompletionCertificates(course.value._id, { format, type });
        downloadZip(zip, zipName);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement des attestations.');
      } finally {
        pdfLoading.value = false;
      }
    };

    const refreshQuestionnaireLinks = async () => {
      try {
        const publishedQuestionnnaires = await Questionnaires.list({ status: PUBLISHED });

        expectationsQuestionnaireId.value = get(publishedQuestionnnaires.find(q => q.type === EXPECTATIONS), '_id');
        if (expectationsQuestionnaireId.value) {
          const expectationsCode = await Questionnaires
            .getQRCode(expectationsQuestionnaireId.value, { course: profileId.value });
          expectationsQRCode.value = expectationsCode;
        }

        endOfCourseQuestionnaireId.value = get(publishedQuestionnnaires.find(q => q.type === END_OF_COURSE), '_id');
        if (endOfCourseQuestionnaireId.value) {
          const endOfCourseCode = await Questionnaires
            .getQRCode(endOfCourseQuestionnaireId.value, { course: profileId.value });
          endOfCourseQRCode.value = endOfCourseCode;
        }
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des questionnaires et des QR codes associés.');
      }
    };

    const goToQuestionnaireProfile = (questionnaireId) => {
      const questionnaire = $router.resolve({
        name: 'ni questionnaires',
        params: { questionnaireId },
        query: { courseId: profileId.value },
      });

      window.open(questionnaire.href, '_blank');
    };

    const created = async () => {
      const promises = [getFollowUp(), getUnsubscribedAttendances()];
      if (!isClientInterface) promises.push(refreshQuestionnaires(), refreshQuestionnaireLinks());

      await Promise.all(promises);
    };

    created();

    return {
      // Data
      questionnaires,
      unsubscribedAttendances,
      columns,
      pagination,
      isIntraOrIntraHoldingOrVendor,
      learners,
      learnersLoading,
      expectationsQuestionnaireId,
      endOfCourseQuestionnaireId,
      expectationsQRCode,
      endOfCourseQRCode,
      isClientInterface,
      EXPECTATIONS,
      END_OF_COURSE,
      OFFICIAL,
      CUSTOM,
      // Computed
      course,
      courseHasElearningStep,
      disableDownloadCompletionCertificates,
      followUpDisabled,
      followUpMissingInfo,
      disableDocDownload,
      isArchived,
      areQuestionnaireAnswersVisible,
      areQuestionnaireVisible,
      areQuestionnaireQRCodeVisible,
      isRofOrVendorAdmin,
      canReadCompletionCertificate,
      // Methods
      get,
      formatQuantity,
      goToQuestionnaireAnswers,
      downloadCompletionCertificates,
      downloadAttendanceSheet,
      goToQuestionnaireProfile,
    };
  },
};
</script>

<style lang="sass" scoped>
.questionnaires-container
  display: grid
  grid-auto-flow: row
  grid-auto-rows: 1fr
  grid-template-columns: repeat(auto-fill, 224px)
  grid-gap: 16px

.dates
  width: 10%

.hours
  width: 15%

.trainer
  width: 50%

.misc
  width: 15%

.expanding-table-expanded-row
  justify-content: flex-start
  div
    justify-content: center
    display: flex
    align-items: center
    justify-content: flex-start
    margin-right: 2%
    word-break: break-word

.questionnaire-link-container
  margin-bottom: 24px
  display: grid
  grid-auto-flow: row
  grid-gap: 24px
  grid-template-rows: auto
  @media screen and (min-width: 768px)
    grid-auto-rows: 1fr
    grid-template-columns: repeat(2, 1fr)
</style>
