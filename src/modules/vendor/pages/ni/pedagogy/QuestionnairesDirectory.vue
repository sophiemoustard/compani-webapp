<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Questionnaires" class="q-mb-xl" />
    <div v-for="group in questionnairesByType" :key="group.type" class="q-mb-lg ">
      <div class="text-weight-bold">{{ QUESTIONNAIRE_TYPES[group.type] }}</div>
      <div v-if="group.list" class="row">
        <questionnaire-cell v-for="(questionnaire, index) in group.list" :key="questionnaire._id"
          :index="group.list.length - index" :questionnaire="questionnaire" class="q-my-md q-mr-md"
          @click="goToQuestionnaireProfile(questionnaire._id)" />
      </div>
      <div v-else class="text-italic q-mb-md">Aucun questionnaire "{{ QUESTIONNAIRE_TYPES[group.type] }}"</div>
    </div>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer un questionnaire"
      @click="questionnaireCreationModal = true" :disable="loading" />

    <questionnaire-creation-modal v-model="questionnaireCreationModal" @hide="resetCreationModal"
      :loading="modalLoading" @submit="createQuestionnaire" :validations="v$.newQuestionnaire"
      v-model:new-questionnaire="newQuestionnaire" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import groupBy from 'lodash/groupBy';
import Questionnaires from '@api/Questionnaires';
import TitleHeader from '@components/TitleHeader';
import QuestionnaireCell from '@components/courses/QuestionnaireCell';
import QuestionnaireCreationModal from 'src/modules/vendor/components/programs/QuestionnaireCreationModal';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { QUESTIONNAIRE_TYPES } from '@data/constants';
import { descendingSortBy } from '@helpers/dates/utils';

export default {
  name: 'QuestionnairesDirectory',
  components: {
    'ni-title-header': TitleHeader,
    'questionnaire-creation-modal': QuestionnaireCreationModal,
    'questionnaire-cell': QuestionnaireCell,
  },
  setup () {
    const metaInfo = { title: 'Questionnaires' };
    useMeta(metaInfo);

    const $router = useRouter();

    const loading = ref(false);
    const questionnairesByType = ref([]);
    const modalLoading = ref(false);
    const questionnaireCreationModal = ref(false);
    const newQuestionnaire = ref({ name: '', type: '' });
    const questionnaireTypes = ref([]);

    const rules = computed(() => ({ newQuestionnaire: { name: { required }, type: { required } } }));
    const v$ = useVuelidate(rules, { newQuestionnaire });

    const goToQuestionnaireProfile = (questionnaireId) => {
      $router.push({ name: 'ni pedagogy questionnaire profile', params: { questionnaireId } });
    };

    const refreshQuestionnaires = async () => {
      try {
        loading.value = true;
        const questionnaires = await Questionnaires.list();

        const questionnairesGroups = groupBy(
          questionnaires.sort(descendingSortBy('createdAt')),
          q => q.type
        );

        questionnairesByType.value = Object.keys(QUESTIONNAIRE_TYPES)
          .map(type => ({ type, list: questionnairesGroups[type] }));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des questionnaires.');
        questionnairesByType.value = [];
      } finally {
        loading.value = false;
      }
    };

    const resetCreationModal = () => {
      v$.value.newQuestionnaire.$reset();
      newQuestionnaire.value = { name: '', type: '' };
    };

    const createQuestionnaire = async () => {
      try {
        v$.value.newQuestionnaire.$touch();
        if (v$.value.newQuestionnaire.$error) return NotifyWarning('Champ(s) invalide(s)');

        modalLoading.value = true;
        await Questionnaires.create(newQuestionnaire.value);

        questionnaireCreationModal.value = false;
        NotifyPositive('Questionnaire créé.');
        await refreshQuestionnaires();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyWarning(e.data.message);
        NotifyNegative('Erreur lors de la création du questionnaire.');
      } finally {
        modalLoading.value = false;
      }
    };

    const created = async () => {
      await refreshQuestionnaires();
    };

    created();

    return {
      // Data
      loading,
      questionnairesByType,
      QUESTIONNAIRE_TYPES,
      modalLoading,
      questionnaireCreationModal,
      newQuestionnaire,
      questionnaireTypes,
      // Methods
      goToQuestionnaireProfile,
      refreshQuestionnaires,
      resetCreationModal,
      createQuestionnaire,
      // Validations
      v$,
    };
  },
};
</script>
