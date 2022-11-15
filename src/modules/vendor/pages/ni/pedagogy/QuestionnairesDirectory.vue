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

    return { v$: useVuelidate() };
  },
  data () {
    return {
      loading: false,
      questionnairesByType: [],
      modalLoading: false,
      questionnaireCreationModal: false,
      newQuestionnaire: { name: '', type: '' },
      questionnaireTypes: [],
      QUESTIONNAIRE_TYPES,
    };
  },
  validations () {
    return {
      newQuestionnaire: { name: { required }, type: { required } },
    };
  },
  async created () {
    await this.refreshQuestionnaires();
  },
  methods: {
    goToQuestionnaireProfile (questionnaireId) {
      this.$router.push({ name: 'ni pedagogy questionnaire profile', params: { questionnaireId } });
    },
    async refreshQuestionnaires () {
      try {
        this.loading = true;
        const questionnaires = await Questionnaires.list();

        const questionnairesGroups = groupBy(
          questionnaires.sort(descendingSortBy('createdAt')),
          q => q.type
        );

        this.questionnairesByType = Object.keys(QUESTIONNAIRE_TYPES)
          .map(type => ({ type, list: questionnairesGroups[type] }));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des questionnaires.');
        this.questionnairesByType = [];
      } finally {
        this.loading = false;
      }
    },
    resetCreationModal () {
      this.v$.newQuestionnaire.$reset();
      this.newQuestionnaire = { name: '', type: '' };
    },
    async createQuestionnaire () {
      try {
        this.v$.newQuestionnaire.$touch();
        if (this.v$.newQuestionnaire.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Questionnaires.create(this.newQuestionnaire);

        this.questionnaireCreationModal = false;
        NotifyPositive('Questionnaire créé.');
        await this.refreshQuestionnaires();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyWarning(e.data.message);
        NotifyNegative('Erreur lors de la création du questionnaire.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
};
</script>
