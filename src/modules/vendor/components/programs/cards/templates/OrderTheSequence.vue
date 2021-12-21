<template>
  <div class="container">
    <ni-input class="q-mb-lg" caption="Question" v-model="card.question" required-field :disable="disableEdition"
      @focus="saveTmp('question')" @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea"
      :error-message="questionErrorMsg" />
    <div v-for="(orderedAnswers, i) in card.orderedAnswers" :key="i" class="answers">
      <ni-input :caption="`Réponse ${i + 1}`" v-model="card.orderedAnswers[i].text"
        @focus="saveTmp(`orderedAnswers[${i}].text`)" @blur="updateTextAnswer(i)" :disable="disableEdition"
        :error="$v.card.orderedAnswers.$each[i].$error" class="input" :required-field="answerIsRequired(i)" />
      <ni-button icon="delete" @click="validateAnswerDeletion(i)" :disable="disableAnswerDeletion" />
    </div>
    <ni-button class="q-mb-lg add-button" icon="add" label="Ajouter une réponse" color="primary" @click="addAnswer"
    :disable="disableAnswerCreation" />
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import { required, maxLength } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import {
  QUESTION_MAX_LENGTH,
  ORDER_THE_SEQUENCE_MIN_ANSWERS_COUNT,
  ORDER_THE_SEQUENCE_MAX_ANSWERS_COUNT,
  PUBLISHED,
} from '@data/constants';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import Button from '@components/Button';

export default {
  name: 'OrderTheSequence',
  props: {
    disableEdition: { type: Boolean, default: false },
    cardParent: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-input': Input,
    'ni-button': Button,
  },
  mixins: [templateMixin],
  validations () {
    return {
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        orderedAnswers: { $each: { text: { required } } },
        explanation: { required },
      },
    };
  },
  computed: {
    disableAnswerCreation () {
      return this.card.orderedAnswers.length >= ORDER_THE_SEQUENCE_MAX_ANSWERS_COUNT ||
        this.disableEdition || this.cardParent.status === PUBLISHED;
    },
    disableAnswerDeletion () {
      return this.card.orderedAnswers.length <= ORDER_THE_SEQUENCE_MIN_ANSWERS_COUNT ||
        this.disableEdition || this.cardParent.status === PUBLISHED;
    },
  },
  methods: {
    answerIsRequired (index) {
      return index < ORDER_THE_SEQUENCE_MIN_ANSWERS_COUNT;
    },
  },
};
</script>
<style lang="sass" scoped>
.container
  display: flex
  flex-direction: column
.answers
  display: flex
  justify-content: space-between
.input
  flex: 1
.add-button
  align-self: flex-end
</style>
