<template v-if="orderedAnswersInitialized">
  <div>
    <ni-input class="q-mb-lg" caption="Question" v-model.trim="card.question" required-field
      @focus="saveTmp('question')" @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea" />
    <div class="q-mb-lg">
      <ni-input v-for="(answer, i) in card.orderedAnswers" :key="i" :caption="`Réponse ${i + 1}`"
        v-model.trim="card.orderedAnswers[i]" @focus="saveTmp(`orderedAnswers[${i}]`)" :required-field="i < 2"
        @blur="updateOrderedAnswer(i)" :error="requiredOrderedAnswerIsMissing(i)" />
    </div>
    <ni-input caption="Correction" v-model.trim="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" />
  </div>
</template>

<script>
import times from 'lodash/times';
import { required } from 'vuelidate/lib/validators';
import Cards from '@api/Cards';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { ORDER_THE_SEQUENCE_MAX_ANSWERS_COUNT } from '@data/constants';
import { minArrayLength } from '@helpers/vuelidateCustomVal';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'OrderTheSequence',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  data () {
    return {
      orderedAnswersCountInDb: 0,
    };
  },
  validations () {
    return {
      card: {
        question: { required },
        orderedAnswers: { minLength: minArrayLength(1) },
        explanation: { required },
      },
    };
  },
  computed: {
    orderedAnswersInitialized () {
      return this.card.orderedAnswers.length === ORDER_THE_SEQUENCE_MAX_ANSWERS_COUNT;
    },
  },
  async mounted () {
    this.initializeOrderedAnswers();
  },
  watch: {
    card () {
      this.initializeOrderedAnswers();
    },
  },
  methods: {
    initializeOrderedAnswers () {
      this.orderedAnswersCountInDb = this.card.orderedAnswers.length;
      this.card.orderedAnswers = times(ORDER_THE_SEQUENCE_MAX_ANSWERS_COUNT, i => this.card.orderedAnswers[i] || '');
    },
    requiredOrderedAnswerIsMissing (index) {
      return this.$v.card.orderedAnswers.$error &&
        !this.$v.card.orderedAnswers.minLength &&
        this.card.orderedAnswers.filter(a => !!a).length < this.orderedAnswersCountInDb &&
        index < 2 &&
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
