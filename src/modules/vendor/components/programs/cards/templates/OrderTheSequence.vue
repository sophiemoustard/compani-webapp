<template v-if="orderedAnswersInitialized">
  <div>
    <ni-input class="q-mb-lg" caption="Question" v-model="card.question" required-field :disable="disableEdition"
      @focus="saveTmp('question')" @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea"
      :error-message="questionErrorMsg" />
    <div class="q-mb-lg">
      <ni-input v-for="(answer, i) in card.orderedAnswers" :key="i" :caption="`Réponse ${i + 1}`"
        v-model.trim="card.orderedAnswers[i]" @focus="saveTmp(`orderedAnswers[${i}]`)" :required-field="i < 2"
        @blur="updateOrderedAnswer(i)" :error="requiredOrderedAnswerIsMissing(i)" :disable="disableEdition" />
    </div>
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import times from 'lodash/times';
import { required, maxLength } from 'vuelidate/lib/validators';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { ORDER_THE_SEQUENCE_MAX_ANSWERS_COUNT, QUESTION_MAX_LENGTH } from '@data/constants';
import { minArrayLength } from '@helpers/vuelidateCustomVal';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'OrderTheSequence',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  validations () {
    return {
      card: {
        question: { required, maxLength: maxLength(QUESTION_MAX_LENGTH) },
        orderedAnswers: { minLength: minArrayLength(2) },
        explanation: { required },
      },
    };
  },
  computed: {
    orderedAnswersInitialized () {
      return this.card.orderedAnswers.length === ORDER_THE_SEQUENCE_MAX_ANSWERS_COUNT;
    },
  },
  watch: {
    card: {
      handler: 'initializeOrderedAnswers',
      immediate: true,
    },
  },
  methods: {
    initializeOrderedAnswers () {
      this.card.orderedAnswers = times(ORDER_THE_SEQUENCE_MAX_ANSWERS_COUNT, i => this.card.orderedAnswers[i] || '');
    },
    requiredOrderedAnswerIsMissing (index) {
      return this.$v.card.orderedAnswers.$error && !this.$v.card.orderedAnswers.minLength && index < 2 &&
        !this.card.orderedAnswers[index];
    },
    async updateOrderedAnswer (index) {
      try {
        if (this.tmpInput === this.card.orderedAnswers[index]) return;

        this.$v.card.orderedAnswers.$touch();
        if (this.requiredOrderedAnswerIsMissing(index)) return NotifyWarning('Champ(s) invalide(s)');

        await Cards.updateById(this.card._id, { orderedAnswers: this.card.orderedAnswers.filter(a => !!a) });

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
