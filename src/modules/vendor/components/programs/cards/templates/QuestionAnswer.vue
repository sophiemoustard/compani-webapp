<template>
  <div>
    <ni-input caption="Question" v-model="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      :disable="disableEdition" />
    <q-checkbox v-model="card.isQuestionAnswerMultipleChoiced" @input="updateCard('isQuestionAnswerMultipleChoiced')"
      size="sm" :disable="disableEdition" label="Sélection multiple" />
    <div class="q-my-lg answers">
      <div v-for="(answer, i) in card.qcAnswers" :key="i" class="answers-container">
        <ni-input :caption="`Réponse ${i + 1}`" v-model="card.qcAnswers[i].text" :disable="disableEdition"
          @blur="updateTextAnswer(i)" @focus="saveTmp(`qcAnswers[${i}].text`)"
          :error="$v.card.qcAnswers.$each[i].$error" class="answers-container-input" />
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
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import {
  QUESTION_MAX_LENGTH,
  QUESTION_ANSWER_MAX_ANSWERS_COUNT,
  QUESTION_ANSWER_MIN_ANSWERS_COUNT,
  PUBLISHED,
} from '@data/constants';
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
        qcAnswers: {
          $each: { text: { required } },
        },
      },
    };
  },
  computed: {
    disableAnswerCreation () {
      return this.card.qcAnswers.length >= QUESTION_ANSWER_MAX_ANSWERS_COUNT ||
        this.disableEdition || this.activity.status === PUBLISHED;
    },
    disableAnswerDeletion () {
      return this.card.qcAnswers.length <= QUESTION_ANSWER_MIN_ANSWERS_COUNT ||
        this.disableEdition || this.activity.status === PUBLISHED;
    },
  },
  methods: {
    async deleteQuestionAnswer (index) {
      try {
        const answerId = get(this.card, `qcAnswers[${index}]._id`);
        if (!answerId) return;
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
.answers
  display: flex
  flex-direction: column
  &-container
    display: flex
    justify-content: space-between
    &-input
      flex: 1
.add-button
  align-self: end
</style>
