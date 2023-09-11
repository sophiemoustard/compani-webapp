<template>
  <div class="card-container">
    <ni-input class="elm-width" bg-color="white" dense :caption="card.question" :model-value="answer"
      @update:model-value="setAnswer" @blur="v$.answer.$touch" type="textarea" :error="v$.answer.$error"
      error-message="Champ requis" placeholder="Veuillez cliquer ici pour répondre" :required-field="isRequired" />
    <ni-footer label="Suivant" @submit="updateQuestionnaireAnswer" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { useStore } from 'vuex';
import { toRefs, computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { INCREMENT } from '@data/constants';
import { NotifyWarning } from '@components/popup/notify';
import Footer from '@components/questionnaires/cards/Footer';
import Input from '@components/form/Input';

export default {
  name: 'OpenQuestion',
  components: {
    'ni-footer': Footer,
    'ni-input': Input,
  },
  props: {
    card: { type: Object, required: true },
  },
  setup (props) {
    const { card } = toRefs(props);
    const answer = ref('');
    const $store = useStore();

    const setAnswer = (value) => { answer.value = value; };

    const updateQuestionnaireAnswer = () => {
      if (isRequired.value) {
        v$.value.answer.$touch();
        if (v$.value.answer.$error) return NotifyWarning('Champ(s) invalide(s).');
      }

      $store.dispatch('questionnaire/updateCardIndex', { type: INCREMENT });
      if (answer.value) {
        $store.dispatch(
          'questionnaire/setAnswerList',
          { answers: [{ card: card.value._id, answerList: [answer.value] }] }
        );
      }
    };

    const isRequired = computed(() => get(card.value, 'isMandatory') || false);

    const rules = computed(() => ({ answer: { required } }));
    const v$ = useVuelidate(rules, { answer });

    const answerList = computed(() => $store.state.questionnaire.answerList);

    const created = () => {
      const initialValue = answerList.value.find(a => a.card === card.value._id);

      setAnswer(get(initialValue, 'answerList[0]'));
    };

    created();
    return {
      // Data
      answer,
      // Computed
      isRequired,
      v$,
      // Methods
      updateQuestionnaireAnswer,
      setAnswer,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
