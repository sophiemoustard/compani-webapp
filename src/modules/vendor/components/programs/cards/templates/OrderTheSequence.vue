<template>
  <div>
    <ni-input class="q-mb-lg" caption="Question" v-model="card.question" required-field :disable="disableEdition"
      @focus="saveTmp('question')" @blur="updateCard('question')" :error="$v.card.question.$error" type="textarea"
      :error-message="questionErrorMsg" />
    <div class="q-mb-lg">
      <ni-input v-for="(answer, i) in card.orderedAnswers" :key="i" :caption="`Réponse ${i + 1}`"
        v-model="card.orderedAnswers[i].text" @focus="saveTmp(`orderedAnswers[${i}].text`)" :required-field="i < 2"
        @blur="updateTextAnswer(i)" :disable="disableEdition" :error="$v.card.orderedAnswers.$each[i].$error" />
    </div>
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="$v.card.explanation.$error" type="textarea" :disable="disableEdition" />
  </div>
</template>

<script>
import { required, maxLength } from 'vuelidate/lib/validators';
import Input from '@components/form/Input';
import { QUESTION_MAX_LENGTH } from '@data/constants';
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
        orderedAnswers: { $each: { text: { required } } },
        explanation: { required },
      },
    };
  },
};
</script>
