<template>
  <div class="card elm-width">
    <p class="title">
      {{ card.question }}
      <span v-if="card.isQuestionAnswerMultipleChoiced"> ( plusieurs réponses sont attendues ) </span>
    </p>
    <div v-for="(answer, index) of card.qcAnswers" :key="answer._id" class="answers">
      <q-checkbox :model-value="isAnswerSelected[index]" @update:model-value="updateSelectedAnswer(index)"
        :label="answer.text" />
    </div>
    <ni-footer label="Suivant" @submit="updateQuestionnaireAnswer" />
  </div>
  {{ card }}
</template>

<script>
import { useStore } from 'vuex';
import { ref, toRefs, computed } from 'vue';
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
    const isAnswerSelected = ref(new Array(card.value.qcAnswers.length).fill(false));

    const updateSelectedAnswer = (index) => {
      isAnswerSelected.value[index] = !isAnswerSelected.value[index];
    };

    const updateQuestionnaireAnswer = () => {
      const answerSelectedIndexes = [...isAnswerSelected.value.keys()].filter(i => isAnswerSelected.value[i]);
      const answer = [];
      answerSelectedIndexes.forEach(idx => answer.push(card.value.qcAnswers[idx]._id));

      $store.dispatch(
        'questionnaire/setAnswerList',
        { answers: [{ card: card.value._id, answerList: [...answer] }] }
      );

      $store.dispatch('questionnaire/updateCardIndex', { type: INCREMENT });
    };

    const answerList = computed(() => $store.state.questionnaire.answerList);

    const created = () => {
      const initialValue = answerList.value.find(a => a.card === card.value._id);

      if (initialValue) {
        for (const answer of initialValue.answerList) {
          const index = card.value.qcAnswers.findIndex(a => a._id === answer);
          isAnswerSelected.value[index] = true;
        }
      }
    };

    created();
    return {
      // Data
      isAnswerSelected,
      // Methods
      updateSelectedAnswer,
      updateQuestionnaireAnswer,
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
