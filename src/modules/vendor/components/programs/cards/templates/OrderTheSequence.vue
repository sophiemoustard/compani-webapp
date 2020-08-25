<template v-if="orderedAnswersInitialized">
  <div>
    <ni-input class="q-mb-lg" caption="Question" v-model.trim="card.question" required-field
      @focus="saveTmp('question')" @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea" />
    <div class="q-mb-lg">
      <ni-input v-for="i in 3" :key="i" :caption="`Réponse ${i}`" @focus="saveTmp(`orderedAnswers[${i - 1}]`)"
        @blur="updateOrderedAnswer(i - 1)" v-model.trim="card.orderedAnswers[i - 1]" :required-field="i < 3"
        :error="requiredOrderedAnswerIsMissing(i - 1)" />
    </div>
    <ni-input caption="Correction" v-model.trim="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" />
  </div>
</template>

<script>
import Input from '@components/form/Input';
import Cards from '@api/Cards';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import times from 'lodash/times';

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
  computed: {
    orderedAnswersInitialized () {
      return this.card.orderedAnswers[2] !== null;
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
      this.card.orderedAnswers = times(3, i => this.card.orderedAnswers[i] || '');
    },
    requiredOrderedAnswerIsMissing (index) {
      return this.$v.card.orderedAnswers.$error &&
        !this.$v.card.orderedAnswers.min2OrderedAnswers &&
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
