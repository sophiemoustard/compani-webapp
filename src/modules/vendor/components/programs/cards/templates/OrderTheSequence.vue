<template>
  <div class="container">
    <ni-input class="q-mb-lg" caption="Question" v-model="card.question" required-field
      @focus="saveTmp('question')" @blur="updateCard('question')" :error="v$.card.question.$error" type="textarea"
      :error-message="errorMsg('question')" />
    <div class="q-mb-lg">
      <div v-for="(orderedAnswers, i) in card.orderedAnswers" :key="i" class="answers">
        <ni-input :caption="`Réponse ${i + 1}`" v-model="orderedAnswers.text"
          @focus="saveTmp(`orderedAnswers[${i}].text`)" @blur="updateTextAnswer(i)"
          :error="getError('orderedAnswers', i)" class="input" required-field />
      </div>
    </div>
    <ni-input caption="Correction" v-model="card.explanation" required-field @focus="saveTmp('explanation')"
      @blur="updateCard('explanation')" :error="v$.card.explanation.$error" type="textarea" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, maxLength, helpers } from '@vuelidate/validators';
import Input from '@components/form/Input';
import { QUESTION_OR_TITLE_MAX_LENGTH } from '@data/constants';
import { useCardTemplate } from 'src/modules/vendor/composables/CardTemplate';

export default {
  name: 'OrderTheSequence',
  components: {
    'ni-input': Input,
  },
  emits: ['refresh'],
  setup (props, { emit }) {
    const $store = useStore();

    const refreshCard = () => { emit('refresh'); };

    const card = computed(() => $store.state.card.card);

    const rules = {
      card: {
        question: { required, maxLength: maxLength(QUESTION_OR_TITLE_MAX_LENGTH) },
        orderedAnswers: { $each: helpers.forEach({ text: { required } }) },
        explanation: { required },
      },
    };
    const v$ = useVuelidate(rules, { card });

    const {
      errorMsg,
      saveTmp,
      updateCard,
      updateTextAnswer,
      getError,
      validateAnswerDeletion,
      addAnswer,
    } = useCardTemplate(card, v$, refreshCard);

    return {
      // Validations
      v$,
      // Computed
      card,
      // Methods
      saveTmp,
      updateCard,
      useCardTemplate,
      updateTextAnswer,
      getError,
      validateAnswerDeletion,
      addAnswer,
      errorMsg,
    };
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
