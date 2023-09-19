<template>
  <div class="card elm-width">
    <p :class="['title', { required: isRequired }]">
      {{ card.question }}
      <span v-if="card.isQuestionAnswerMultipleChoiced"> ( plusieurs réponses sont attendues ) </span>
    </p>
    <div v-for="(answer, index) of card.qcAnswers" :key="answer._id" class="answers">
      <q-checkbox :model-value="isSelectedAnswerList[index]" @update:model-value="updateSelectedAnswer(index)"
        :label="answer.text" />
    </div>
    <ni-footer label="Suivant" @submit="updateQuestionnaireAnswer" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { ref, toRefs, computed } from 'vue';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { minValue } from '@vuelidate/validators';
import { NotifyWarning } from '@components/popup/notify';
import { INCREMENT } from '../../../data/constants';
import Footer from './Footer';

export default {
  name: 'QuestionAnswer',
  components: {
    'ni-footer': Footer,
  },
  props: {
    card: { type: Object, required: true },
  },
  setup (props) {
    const { card } = toRefs(props);
    const $store = useStore();
    const isSelectedAnswerList = ref(new Array(card.value.qcAnswers.length).fill(false));

    const updateSelectedAnswer = (index) => {
      isSelectedAnswerList.value[index] = !isSelectedAnswerList.value[index];
    };

    const updateQuestionnaireAnswer = () => {
      const answer = [];
      const selectedAnswerIndexes = [...isSelectedAnswerList.value.keys()].filter(i => isSelectedAnswerList.value[i]);
      selectedAnswerIndexes.forEach(idx => answer.push(card.value.qcAnswers[idx]._id));

      v$.value.selectedAnswerNumber.$touch();
      if (v$.value.selectedAnswerNumber.$error) return NotifyWarning('Champ requis.');

      $store.dispatch(
        'questionnaire/setAnswerList',
        { answers: [{ card: card.value._id, answerList: [...answer] }] }
      );

      $store.dispatch('questionnaire/updateCardIndex', { type: INCREMENT });
    };

    const selectedAnswerNumber = computed(() => {
      const answerListCard = isSelectedAnswerList.value.filter(val => !!val) || [];
      return answerListCard.length;
    });

    const isRequired = computed(() => get(card.value, 'isMandatory') || false);

    const rules = computed(() => ({ selectedAnswerNumber: { ...isRequired.value && { minValue: minValue(1) } } }));
    const v$ = useVuelidate(rules, { selectedAnswerNumber });

    const answerList = computed(() => $store.state.questionnaire.answerList);
    const created = () => {
      const initialValue = answerList.value.find(a => a.card === card.value._id);

      if (initialValue) {
        for (const asw of initialValue.answerList) {
          const index = card.value.qcAnswers.findIndex(a => a._id === asw);
          isSelectedAnswerList.value[index] = true;
        }
      }
    };

    created();
    return {
      // Data
      isSelectedAnswerList,
      // Methods
      updateSelectedAnswer,
      updateQuestionnaireAnswer,
      // Computed
      isRequired,
    };
  },
};
</script>
<style lang="sass" scoped>
.container
.title
  color: $copper-grey-500
  font-size: 14px
.answers
  display: flex
  flex-direction: column
  padding: 0 0 0 4px
</style>
