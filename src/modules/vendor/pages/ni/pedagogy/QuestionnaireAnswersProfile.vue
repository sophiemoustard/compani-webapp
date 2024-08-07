<template>
  <q-page class="vendor-background" padding>
    <ni-profile-header title="Réponses aux questionnaires">
      <template #title>
        <div class="selector-container">
          <ni-select :model-value="selectedQuestionnaireType" @update:model-value="updateSelectedQuestionnaireType"
            caption="Type de questionnaire" :options="questionnaireOptions" clearable />
          <ni-select v-if="selectedQuestionnaireType === SELF_POSITIONNING" :model-value="selectedProgram"
            @update:model-value="updateSelectedProgram" caption="Programme" :options="programOptions" clearable
            :disable="!isRofOrVendorAdmin" />
        </div>
      </template>
    </ni-profile-header>
    <template v-if="selectedQuestionnaireId">
      <profile-answers v-if="courseId && course" :profile-id="selectedQuestionnaireId" :course="courseInfos"
        :hide-program-filter="!!selectedProgram" />
      <profile-answers v-else-if="!courseId" :profile-id="selectedQuestionnaireId"
        :hide-program-filter="!!selectedProgram" />
    </template>
  </q-page>
</template>

<script>
import { ref, computed, watch, toRefs } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import pick from 'lodash/pick';
import ProfileHeader from '@components/ProfileHeader';
import Select from '@components/form/Select';
import ProfileAnswers from 'src/modules/vendor/components/questionnaires/ProfileAnswers';
import Questionnaires from '@api/Questionnaires';
import { formatAndSortOptions } from '@helpers/utils';
import {
  QUESTIONNAIRE_TYPES,
  SELF_POSITIONNING,
  PUBLISHED,
  TRAINING_ORGANISATION_MANAGER,
  VENDOR_ADMIN,
} from '@data/constants';

export default {
  name: 'QuestionnaireAnswersProfile',
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-select': Select,
    'profile-answers': ProfileAnswers,
  },
  props: {
    questionnaireType: { type: String, enum: QUESTIONNAIRE_TYPES, default: '' },
    courseId: { type: String, default: '' },
  },
  setup (props) {
    const { courseId, questionnaireType } = toRefs(props);
    const selectedQuestionnaireType = ref(questionnaireType.value, '');
    const publishedQuestionnaires = ref([]);
    const selectedProgram = ref('');

    const $store = useStore();

    const course = computed(() => $store.state.course.course);

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const isRofOrVendorAdmin = computed(() => [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER]
      .includes(loggedUser.value.role.vendor.name));

    const questionnaireOptions = Object.keys(QUESTIONNAIRE_TYPES)
      .filter(type => (!isRofOrVendorAdmin.value ? type !== SELF_POSITIONNING : true))
      .map(type => ({ label: QUESTIONNAIRE_TYPES[type], value: type }));

    const selectedQuestionnaireId = computed(() => {
      const selectedQuestionnaire = selectedQuestionnaireType.value === SELF_POSITIONNING
        ? publishedQuestionnaires.value.find(q => get(q, 'program._id') === selectedProgram.value)
        : publishedQuestionnaires.value.find(q => q.type === selectedQuestionnaireType.value);

      return get(selectedQuestionnaire, '_id');
    });

    const programOptions = computed(() => formatAndSortOptions(
      publishedQuestionnaires.value.filter(q => q.program).map(q => q.program),
      'name'
    ));

    const courseInfos = computed(() => (courseId.value
      ? pick(course.value, ['_id', 'trainer', 'companies', 'subProgram', 'type', 'holding'])
      : {}));

    const updateSelectedQuestionnaireType = (value) => { selectedQuestionnaireType.value = value; };

    const updateSelectedProgram = (value) => { selectedProgram.value = value; };

    const getPublishedQuestionnaires = async () => {
      const questionnaires = await Questionnaires.list();

      publishedQuestionnaires.value = questionnaires.filter(q => q.status === PUBLISHED);
    };

    const refreshCourse = async () => {
      try {
        await $store.dispatch('course/fetchCourse', { courseId: courseId.value });
      } catch (e) {
        console.error(e);
      }
    };

    const created = async () => {
      await getPublishedQuestionnaires();
      if (courseId.value) await refreshCourse();

      selectedProgram.value = courseId.value && selectedQuestionnaireType.value === SELF_POSITIONNING
        ? course.value.subProgram.program._id
        : '';
    };

    created();

    watch(selectedQuestionnaireType, () => {
      selectedProgram.value = courseId.value && selectedQuestionnaireType.value === SELF_POSITIONNING
        ? get(course.value, 'subProgram.program._id')
        : '';
    });

    return {
      // Data
      selectedQuestionnaireType,
      questionnaireOptions,
      publishedQuestionnaires,
      selectedProgram,
      SELF_POSITIONNING,
      // Computed
      selectedQuestionnaireId,
      programOptions,
      courseInfos,
      course,
      isRofOrVendorAdmin,
      // Methods
      updateSelectedQuestionnaireType,
      updateSelectedProgram,
    };
  },
};
</script>

<style lang="sass" scoped>
.selector-container
  display: grid
  grid-auto-flow: column
  grid-template-columns: auto
  justify-content: center
  grid-gap: 24px
  @media screen and (max-width: 767px)
    grid-auto-flow: row
    grid-template-rows: auto
    grid-gap: 0px
</style>
