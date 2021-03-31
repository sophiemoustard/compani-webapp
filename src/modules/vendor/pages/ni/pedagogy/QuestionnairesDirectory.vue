<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Questionnaires" class="q-mb-xl" />
    <div v-for="type in questionnaireTypes" :key="type.value">
      <div class="text-weight-bold q-mb-md">{{ type.label }}</div>
      <div class="row">
        <questionnaire-cell v-for="(questionnaire, index) in questionnaires[type.value]" :key="questionnaire.title"
          :index="questionnaires[type.value].length - index" :questionnaire="questionnaire" class="q-mr-md" />
      </div>
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
    await this.refreshQuestionnaire();
    this.questionnaireTypes = QUESTIONNAIRE_TYPES
      .filter(type => Object.keys(this.questionnaires).includes(type.value));
  },
  methods: {
    async refreshQuestionnaire () {
      try {
        this.loading = true;
        this.questionnaires = groupBy(
          (await Questionnaires.list()).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
          q => q.type
        );
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des questionnaires.');
      } finally {
        this.loading = false;
      }
    },
    resetCreationModal () {
      this.$v.newQuestionnaire.$reset();
      this.newQuestionnaire = { title: '' };
    },
    async createQuestionnaire () {
      try {
        this.$v.newQuestionnaire.$touch();
        if (this.$v.newQuestionnaire.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Questionnaires.create({ title: this.newQuestionnaire.title, type: this.newQuestionnaire.type });

        this.questionnaireCreationModal = false;
        NotifyPositive('Questionnaire créé.');
        await this.refreshQuestionnaire();
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
