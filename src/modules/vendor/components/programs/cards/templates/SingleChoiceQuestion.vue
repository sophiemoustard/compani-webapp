<template>
  <div v-if="falsyAnswersInitialized">
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea" />
    <ni-input caption="Bonne réponse" v-model.trim="card.qcuGoodAnswer" required-field class="q-my-lg"
      @focus="saveTmp('qcuGoodAnswer')" :error="$v.card.qcuGoodAnswer.$error" @blur="updateCard('qcuGoodAnswer')" />
    <div class="q-my-lg">
      <ni-input v-for="(answer, i) in card.falsyAnswers" :key="i" :caption="`Mauvaise réponse ${i + 1}`"
        v-model.trim="card.falsyAnswers[i]" :required-field="i === 0"
        @focus="saveTmp(`falsyAnswers[${i}]`)" @blur="updateFalsyAnswer(i)" />
    </div>
    <ni-input caption="Correction" v-model.trim="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" />
  </div>
</template>

<script>
import times from 'lodash/times';
import get from 'lodash/get';
import Input from '@components/form/Input';
import Cards from '@api/Cards';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { SINGLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT } from '@data/constants';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';
import { validationMixin } from '@mixins/validationMixin';

export default {
  name: 'SingleChoiceQuestion',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin, validationMixin],
  computed: {
    falsyAnswersInitialized () {
      return this.card.falsyAnswers.length === SINGLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT;
    },
  },
  async mounted () {
    this.initializeFalsyAnswers();
  },
  watch: {
    card () {
      this.initializeFalsyAnswers();
    },
  },
  methods: {
    initializeFalsyAnswers () {
      this.card.falsyAnswers = times(SINGLE_CHOICE_QUESTION_MAX_ANSWERS_COUNT, i => this.card.falsyAnswers[i] || '');
    },
    formatFalsyAnswersPayload () {
      return this.card.falsyAnswers.filter(a => !!a);
    },
    async updateFalsyAnswer (index) {
      try {
        if (this.tmpInput === get(this.card, `falsyAnswers[${index}]`)) return;

        this.$v.card.falsyAnswers.$touch();
        if (this.$v.card.falsyAnswers.$error) return NotifyWarning('Champ(s) invalide(s)');
        await Cards.updateById(this.card._id, { falsyAnswers: this.formatFalsyAnswersPayload() });

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
