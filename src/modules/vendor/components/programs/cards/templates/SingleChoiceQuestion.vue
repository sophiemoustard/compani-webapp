<template>
  <div v-if="answersInitialized">
    <ni-input caption="Question" v-model.trim="card.question" required-field @focus="saveTmp('question')"
      @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea" />
    <div class="q-my-xl">
      <div v-for="i in 4" :key="i" class="answers">
        <ni-input :caption="`Réponse ${i}`" v-model.trim="card.answers[i - 1].label" :required-field="i < 2"
          @focus="saveTmp(`answers[${i - 1}].label`)" />
      </div>
    </div>
    <ni-input caption="Correction" v-model.trim="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" />
  </div>
</template>

<script>
import times from 'lodash/times';
import Input from '@components/form/Input';
import { templateMixin } from 'src/modules/vendor/mixins/templateMixin';

export default {
  name: 'SingleChoiceQuestion',
  components: {
    'ni-input': Input,
  },
  mixins: [templateMixin],
  computed: {
    answersInitialized () {
      return !!this.card.answers[5];
    },
  },
  async mounted () {
    this.initializeAnswers();
  },
  watch: {
    card () {
      this.initializeAnswers();
    },
  },
  methods: {
    initializeAnswers () {
      this.answersLengthInDb = this.card.answers.length;
      this.card.answers = times(6, i => this.card.answers[i] || ({ label: '' }));
    },
  },
};
</script>

<style lang="stylus" scoped>
.answers
  display: flex
  flex-direction: row
  .input
    flex: 1
</style>
