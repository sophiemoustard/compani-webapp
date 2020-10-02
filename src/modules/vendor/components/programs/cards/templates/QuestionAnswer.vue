<template>
  <div v-if="questionAnswersInitialized">
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      :disable="disableEdition" />
    <q-checkbox v-model="card.isQuestionAnswerMultipleChoiced" @input="updateCard('isQuestionAnswerMultipleChoiced')"
      size="sm" :disable="disableEdition" label="Sélection multiple" />
    <div class="q-my-lg">
      <ni-input v-for="(answer, i) in card.questionAnswers" :key="i" :caption="`Réponse ${i + 1}`"
        v-model.trim="card.questionAnswers[i]" :required-field="i === 0" :error="requiredQuestionAnswerIsMissing(i)"
        @focus="saveTmp(`questionAnswers[${i}]`)" @blur="updateQuestionAnswers(i)" :disable="disableEdition" />
    </div>
  </div>
</template>

<script>
import times from 'lodash/times';
import get from 'lodash/get';
import { required, maxLength } from 'vuelidate/lib/validators';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { QUESTION_ANSWER_MAX_ANSWERS_COUNT, QUESTION_MAX_LENGTH } from '@data/constants';
import { minArrayLength } from '@helpers/vuelidateCustomVal';
import { validationMixin } from '@mixins/validationMixin';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'QuestionAnswer',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin, validationMixin],
  validations () {
    return {
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        questionAnswers: {
          required,
          minLength: minArrayLength(1),
        },
      },
    };
  },
  computed: {
    questionAnswersInitialized () {
      return this.card.questionAnswers.length === QUESTION_ANSWER_MAX_ANSWERS_COUNT;
    },
  },
  watch: {
    card: {
      handler: 'initializeQuestionAnswers',
      immediate: true,
    },
  },
  methods: {
    initializeQuestionAnswers () {
      this.card.questionAnswers = times(
        QUESTION_ANSWER_MAX_ANSWERS_COUNT,
        i => this.card.questionAnswers[i] || ''
      );
    },
    requiredQuestionAnswerIsMissing (index) {
      return this.$v.card.questionAnswers.$error && !this.$v.card.questionAnswers.minLength && index === 0 &&
      !this.card.questionAnswers[index];
    },
    formatQuestionAnswersPayload () {
      return this.card.questionAnswers.filter(a => !!a);
    },
    async updateQuestionAnswers (index) {
      try {
        if (this.tmpInput === get(this.card, `questionAnswers[${index}]`)) return;

        this.$v.card.questionAnswers.$touch();
        if (this.requiredQuestionAnswerIsMissing(index)) return NotifyWarning('Champ(s) invalide(s)');
        await Cards.updateById(this.card._id, { questionAnswers: this.formatQuestionAnswersPayload() });

        await this.refreshCard();

        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    },
  },
};
</script>
