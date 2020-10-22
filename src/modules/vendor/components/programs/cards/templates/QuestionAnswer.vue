<template>
  <div>
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" :error-message="questionErrorMsg"
      :disable="disableEdition" />
    <q-checkbox v-model="card.isQuestionAnswerMultipleChoiced" @input="updateCard('isQuestionAnswerMultipleChoiced')"
      size="sm" :disable="disableEdition" label="Sélection multiple" />
    <div class="q-my-lg answers-container">
      <ni-input v-for="(answer, i) in card.questionAnswers" :key="i" :caption="`Réponse ${i + 1}`"
        v-model="card.questionAnswers[i].text" :disable="disableEdition" @blur="updateQuestionAnswers(i)"
        @focus="saveTmp(`questionAnswers[${i}.text]`)" :error="$v.card.questionAnswers.$each[i].$error" />
      <ni-button class="add-button" icon="add" label="Ajouter une réponse" color="primary" @click="addAnswer" />
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
import { QUESTION_MAX_LENGTH } from '@data/constants';
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
    'ni-button': Button,
  },
  mixins: [templateMixin, validationMixin],
  validations () {
    return {
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        questionAnswers: {
          required,
          minLength: minArrayLength(2),
          $each: {
            text: { required },
          },
        },
      },
    };
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
  },
};
</script>

<style lang="stylus" scoped>
.answers-container
  display: flex
  flex-direction: column
.add-button
  align-self: end
</style>
