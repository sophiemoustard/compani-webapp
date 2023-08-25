<template>
  <div class="card-container">
    <ni-input class="elm-width" :model-value="answer" @update:model-value="setAnswer" :caption="card.question"
      type="textarea" bg-color="white" dense placeholder="Veuillez cliquer ici pour répondre" :error="displayError"
      error-message="Champ requis" :required-field="isRequired" />
    <ni-footer label="Suivant" @submit="updateQuestionnaireAnswer(INCREMENT)" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { toRefs, computed, ref } from 'vue';
import { INCREMENT } from '@data/constants';
import Footer from '@components/questionnaires/cards/Footer';
import Input from '@components/form/Input';

export default {
  name: 'OpenQuestion',
  components: {
    'ni-footer': Footer,
    'ni-input': Input,
  },
  emits: ['submit'],
  props: {
    card: { type: Object, required: true },
  },
  setup (props, { emit }) {
    const { card } = toRefs(props);
    const answer = ref('');

    const setAnswer = (value) => { answer.value = value; };

    const updateQuestionnaireAnswer = (type) => {
      emit('submit', { type, answers: [{ card: card.value._id, answerList: [answer.value] }] });
    };

    const isRequired = computed(() => get(card.value, 'isMandatory') || false);

    const displayError = computed(() => isRequired.value === true && !answer.value);

    return {
      // Data
      INCREMENT,
      answer,
      // Computed
      isRequired,
      displayError,
      // Methods
      updateQuestionnaireAnswer,
      setAnswer,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
