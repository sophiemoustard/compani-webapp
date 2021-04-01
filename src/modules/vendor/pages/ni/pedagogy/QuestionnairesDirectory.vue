<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Questionnaires" class="q-mb-xl" />
    <div v-for="questionnairesByType in questionnaires" :key="questionnairesByType.type.value">
      <div class="text-weight-bold">{{ questionnairesByType.type.label }}</div>
      <div v-if="questionnairesByType.questionnairesList" class="row">
        <questionnaire-cell v-for="(questionnaire, index) in questionnairesByType.questionnairesList"
          :key="questionnaire._id" :index="questionnairesByType.questionnairesList.length - index"
          :questionnaire="questionnaire" class="q-my-md q-mr-md" />
      </div>
      <div v-else class="text-italic">Aucun questionnaire "{{ questionnairesByType.type.label }}"</div>
    </div>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Créer un questionnaire"
      @click="questionnaireCreationModal = true" :disable="loading" />

    <questionnaire-creation-modal v-model="questionnaireCreationModal" @hide="resetCreationModal"
      :loading="modalLoading" @submit="createQuestionnaire" :validations="$v.newQuestionnaire"
      :new-questionnaire.sync="newQuestionnaire" />
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import groupBy from 'lodash/groupBy';
import Questionnaires from '@api/Questionnaires';
import TitleHeader from '@components/TitleHeader';
import QuestionnaireCell from '@components/courses/QuestionnaireCell';
import QuestionnaireCreationModal from 'src/modules/vendor/components/programs/QuestionnaireCreationModal';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { QUESTIONNAIRE_TYPES } from '@data/constants';
import { descendingSort } from '@helpers/date';

export default {
  metaInfo: { title: 'Questionnaires' },
  name: 'QuestionnairesDirectory',
  components: {
    'ni-title-header': TitleHeader,
    'questionnaire-creation-modal': QuestionnaireCreationModal,
    'questionnaire-cell': QuestionnaireCell,
  },
  data () {
    return {
      loading: false,
      questionnaires: [],
      modalLoading: false,
      questionnaireCreationModal: false,
      newQuestionnaire: { title: '', type: '' },
      questionnaireTypes: [],
    };
  },
  validations () {
    return {
      newQuestionnaire: { title: { required }, type: { required } },
    };
  },
  async created () {
    await this.refreshQuestionnaires();
  },
  methods: {
    async refreshQuestionnaires () {
      try {
        this.loading = true;
        const questionnaires = await Questionnaires.list();

        const questionnairesByType = groupBy(
          questionnaires.sort((a, b) => descendingSort(a.createdAt, b.createdAt)),
          q => q.type
        );

        this.questionnaires = QUESTIONNAIRE_TYPES
          .map(q => ({ type: q, questionnairesList: questionnairesByType[q.value] }));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des questionnaires.');
        this.questionnaires = [];
      } finally {
        this.loading = false;
      }
    },
    resetCreationModal () {
      this.$v.newQuestionnaire.$reset();
      this.newQuestionnaire = { title: '', type: '' };
    },
    async createQuestionnaire () {
      try {
        this.$v.newQuestionnaire.$touch();
        if (this.$v.newQuestionnaire.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Questionnaires.create(this.newQuestionnaire);

        this.questionnaireCreationModal = false;
        NotifyPositive('Questionnaire créé.');
        await this.refreshQuestionnaires();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du questionnaire.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
};
</script>
