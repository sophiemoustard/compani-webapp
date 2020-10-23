<template>
  <div>
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      :disable="disableEdition" />
    <q-checkbox v-model="card.isQuestionAnswerMultipleChoiced" @input="updateCard('isQuestionAnswerMultipleChoiced')"
      size="sm" :disable="disableEdition" label="Sélection multiple" />
    <div class="q-my-lg answers-container">
      <div v-for="(answer, i) in card.questionAnswers" :key="i">
        <ni-input :caption="`Réponse ${i + 1}`" v-model="card.questionAnswers[i].text" :disable="disableEdition"
          @blur="updateQuestionAnswers(i)" @focus="saveTmp(`questionAnswers[${i}.text]`)"
          :error="$v.card.questionAnswers.$each[i].$error" />
        <ni-button icon="delete" @click="deleteQuestionAnswer(i)" :disable="disableAnswerDeletion" />
      </div>
      <ni-button class="add-button" icon="add" label="Ajouter une réponse" color="primary" @click="addAnswer"
        :disable="disableAnswerCreation" />
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import { required, maxLength } from 'vuelidate/lib/validators';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import Button from '@components/Button';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import {
  QUESTION_MAX_LENGTH,
  QUESTION_ANSWER_MAX_ANSWERS_COUNT,
  QUESTION_ANSWER_MIN_ANSWERS_COUNT,
  PUBLISHED,
} from '@data/constants';
import { minArrayLength, maxArrayLength } from '@helpers/vuelidateCustomVal';
import { validationMixin } from '@mixins/validationMixin';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'QuestionAnswer',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-button': Button,
  },
  mixins: [templateMixin, validationMixin],
  validations () {
    return {
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        questionAnswers: {
          required,
          minLength: minArrayLength(QUESTION_ANSWER_MIN_ANSWERS_COUNT),
          maxLength: maxArrayLength(QUESTION_ANSWER_MAX_ANSWERS_COUNT),
          $each: { text: { required } },
        },
      },
    };
  },
  computed: {
    disableAnswerCreation () {
      return this.card.questionAnswers.length >= QUESTION_ANSWER_MAX_ANSWERS_COUNT ||
        this.disableEdition || this.activity.status === PUBLISHED;
    },
    disableAnswerDeletion () {
      return this.card.questionAnswers.length <= QUESTION_ANSWER_MIN_ANSWERS_COUNT ||
        this.disableEdition || this.activity.status === PUBLISHED;
    },
  },
  methods: {
    formatQuestionAnswersPayload () {
      return this.card.questionAnswers.filter(a => !!a);
    },
    async updateQuestionAnswers (index) {
      try {
        const editedAnswer = get(this.card, `questionAnswers[${index}]`);
        if (this.tmpInput === editedAnswer.text) return;

        this.$v.card.questionAnswers.$touch();
        if (this.$v.card.questionAnswers.$each[index].$error) return NotifyWarning('Champ(s) invalide(s).');

        await Cards.updateAnswer({ cardId: this.card._id, answerId: editedAnswer._id }, { text: editedAnswer.text });

        await this.refreshCard();

        NotifyPositive('Carte mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la carte.');
      }
    },
    async addAnswer () {
      try {
        await Cards.addAnswer(this.card._id);
        await this.refreshCard();

        NotifyPositive('Réponse ajoutée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de la réponse.');
      }
    },
    async deleteQuestionAnswer (index) {
      try {
        const answerId = get(this.card, `questionAnswers[${index}]`)._id;
        await Cards.deleteAnswer({ cardId: this.card._id, answerId });

        await this.refreshCard();
        NotifyPositive('Réponse supprimée avec succès.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de la réponse.');
      }
    },
  },
};
</script>

<style lang="stylus" scoped>
.answers-container
  display: flex
  flex-direction: column
  justify-content: space-between
.add-button
  align-self: end
</style>
