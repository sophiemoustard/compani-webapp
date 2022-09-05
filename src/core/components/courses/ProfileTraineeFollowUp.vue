<template>
  <div>
    <div class="q-mt-lg q-mb-xl">
      <p class="text-weight-bold">Émargements</p>
      <div v-if="isIntraOrVendor" class="q-mb-md">
        <ni-banner v-if="followUpDisabled">
          <template #message>
            Il manque {{ formatQuantity('information', followUpMissingInfo.length ) }}
            pour assurer le suivi de la formation : {{ followUpMissingInfo.join(', ') }}.
          </template>
        </ni-banner>
        <ni-bi-color-button icon="file_download" label="Feuilles d'émargement vierges"
          :disable="disableDocDownload" @click="downloadAttendanceSheet" size="16px" />
      </div>
      <attendance-table :course="course" />
    </div>
    <div v-if="areQuestionnaireAnswersVisible" class="q-mb-xl">
      <p class="text-weight-bold">Réponses aux questionnaires</p>
      <div class="questionnaires-container">
        <questionnaire-answers-cell v-for="questionnaire in questionnaires" :key="questionnaire._id"
          :questionnaire="questionnaire" @click="goToQuestionnaireAnswers(questionnaire._id)" />
      </div>
    </div>
    <elearning-follow-up-table v-if="courseHasElearningStep" :learners="learners" class="q-mb-xl"
      is-blended />
    <div class="q-mb-sm">
      <p class="text-weight-bold">Attestations de formation</p>
      <ni-banner v-if="!get(this.course, 'subProgram.program.learningGoals')">
        <template #message>
          Merci de renseigner les objectifs pédagogiques du programme pour pouvoir télécharger
          les attestations de fin de formation.
        </template>
      </ni-banner>
      <ni-bi-color-button icon="file_download" label="Attestations"
        :disable="disableDownloadCompletionCertificates" @click="downloadCompletionCertificates" size="16px" />
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
import get from 'lodash/get';
import { computed, ref, toRefs } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import Courses from '@api/Courses';
import Attendances from '@api/Attendances';
import { NotifyNegative } from '@components/popup/notify';
import AttendanceTable from '@components/table/AttendanceTable';
import ExpandingTable from '@components/table/ExpandingTable';
import ElearningFollowUpTable from '@components/courses/ElearningFollowUpTable';
import QuestionnaireAnswersCell from '@components/courses/QuestionnaireAnswersCell';
import BiColorButton from '@components/BiColorButton';
import Banner from '@components/Banner';
import { E_LEARNING } from '@data/constants';
import { formatIdentity, formatQuantity, formatDownloadName } from '@helpers/utils';
import { formatDate, ascendingSort, getTotalDuration, getDuration, formatIntervalHourly } from '@helpers/date';
import { composeCourseName } from '@helpers/courses';
import { downloadZip } from '@helpers/file';
import { useCourses } from '@composables/courses';
import { useTraineeFollowUp } from '@composables/traineeFollowUp';

export default {
  name: 'ProfileTraineeFollowUp',
  components: {
    'elearning-follow-up-table': ElearningFollowUpTable,
    'attendance-table': AttendanceTable,
    'ni-expanding-table': ExpandingTable,
    'questionnaire-answers-cell': QuestionnaireAnswersCell,
    'ni-bi-color-button': BiColorButton,
    'ni-banner': Banner,
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

    const course = computed(() => $store.state.course.course);

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const {
      isClientInterface,
      pdfLoading,
      isIntraOrVendor,
      disableDocDownload,
      followUpDisabled,
      followUpMissingInfo,
      downloadAttendanceSheet,
    } = useCourses(course);
    const { learners, getLearnersList } = useTraineeFollowUp(profileId);

    const areQuestionnaireAnswersVisible = computed(() => !isClientInterface && questionnaires.value.length);

    const courseHasElearningStep = computed(() => course.value.subProgram.steps.some(step => step.type === E_LEARNING));

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
      duration: getTotalDuration(attendancesGroupedByTrainee[traineeId].map(a => a.courseSlot)),
      attendances: attendancesGroupedByTrainee[traineeId]
        .sort((a, b) => ascendingSort(a.courseSlot.startDate, b.courseSlot.startDate))
        .map(a => ({
          _id: a._id,
          date: formatDate(a.courseSlot.startDate),
          hours: `${formatIntervalHourly(a.courseSlot)} (${getDuration(a.courseSlot)})`,
          trainer: formatIdentity(get(a, 'trainer.identity'), 'FL'),
          misc: a.misc,
        })),
    });

    const getUnsubscribedAttendances = async () => {
      try {
        const query = {
          course: course.value._id,
          ...(isClientInterface && { company: loggedUser.value.company._id }),
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

    const downloadCompletionCertificates = async () => {
      if (disableDownloadCompletionCertificates.value) return;

      try {
        pdfLoading.value = true;
        const formattedName = formatDownloadName(`attestations ${composeCourseName(course.value, true)}`);
        const zipName = `${formattedName}.zip`;
        const pdf = await Courses.downloadCompletionCertificates(course.value._id);
        downloadZip(pdf, zipName);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement des attestations.');
      } finally {
        pdfLoading.value = false;
      }
    };

    const created = async () => {
      const promises = [getLearnersList(), getUnsubscribedAttendances()];
      if (!isClientInterface) promises.push(refreshQuestionnaires());

      await Promise.all(promises);
    };

    created();

    return {
      // Data
      questionnaires,
      unsubscribedAttendances,
      columns,
      pagination,
      isIntraOrVendor,
      learners,
      // Computed
      course,
      areQuestionnaireAnswersVisible,
      courseHasElearningStep,
      disableDownloadCompletionCertificates,
      followUpDisabled,
      followUpMissingInfo,
      disableDocDownload,
      // Methods
      get,
      formatQuantity,
      goToQuestionnaireAnswers,
      downloadCompletionCertificates,
      downloadAttendanceSheet,
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
</style>
