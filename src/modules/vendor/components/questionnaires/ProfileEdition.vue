<template>
  <div class="row col-md-6">
    <ni-input v-model.trim="questionnaire.title" required-field caption="Titre" @blur="updateQuestionnaireTitle"
      @focus="saveTmpTitle" :error="$v.questionnaire.title.$error" :disable="questionnaire.status === PUBLISHED" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import Questionnaires from '@api/Questionnaires';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import Input from '@components/form/Input';
import { PUBLISHED } from '@data/constants';

export default {
  name: 'ProfileEdition',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-input': Input,
  },
  validations () {
    return {
      questionnaire: { title: { required } },
    };
  },
  data () {
    return {
      tmpInput: '',
      PUBLISHED,
    };
  },
  computed: {
    ...mapState('questionnaire', ['questionnaire']),
  },
  async created () {
    await this.refreshQuestionnaire();
  },
  methods: {
    async refreshQuestionnaire () {
      try {
        await this.$store.dispatch('questionnaire/fetchQuestionnaire', { questionnaireId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    saveTmpTitle () {
      this.tmpInput = get(this.questionnaire, 'title') || '';
    },
    async updateQuestionnaireTitle () {
      try {
        const title = get(this.questionnaire, 'title');
        if (this.tmpInput === title) return;
        this.$v.questionnaire.$touch();

        if (this.$v.questionnaire.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Questionnaires.update(this.questionnaire._id, { title });
        NotifyPositive('Modification enregistrée.');

        await this.refreshQuestionnaire();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du questionnaire.');
      } finally {
        this.tmpInput = '';
      }
    },
  },
};
</script>
