<template>
  <div class="card elm-width">
    <p :class="['title', { required: isRequired }]">
      {{ card.question }}
      <span v-if="card.isQuestionAnswerMultipleChoiced"> ( plusieurs réponses sont attendues ) </span>
    </p>
    <div v-for="(qcAnswer, index) of card.qcAnswers" :key="qcAnswer._id" class="answers">
      <q-checkbox v-if="card.isQuestionAnswerMultipleChoiced" :model-value="multipleSelectionList[index]"
        @update:model-value="updateSelectedAnswer(index)" :label="qcAnswer.text" />
      <q-radio v-else v-model="singleSelection" :val="qcAnswer._id" :label="qcAnswer.text" />
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
    const multipleSelectionList = ref(new Array(card.value.qcAnswers.length).fill(false));
    const singleSelection = ref(false);
    const answer = ref([]);
    const $store = useStore();

    const updateSelectedAnswer = (index) => {
      multipleSelectionList.value[index] = !multipleSelectionList.value[index];
    };

    const updateQuestionnaireAnswer = () => {
      if (card.value.isQuestionAnswerMultipleChoiced) {
        const selectedAnswerIndexes = [...multipleSelectionList.value.keys()]
          .filter(i => multipleSelectionList.value[i]);
        selectedAnswerIndexes.forEach(idx => answer.value.push(card.value.qcAnswers[idx]._id));
      } else {
        answer.value.push(singleSelection.value);
      }

      v$.value.selectedAnswerNumber.$touch();
      if (v$.value.selectedAnswerNumber.$error) return NotifyWarning('Champ requis.');

      $store.dispatch(
        'questionnaire/setAnswerList',
        { answers: [{ card: card.value._id, answerList: answer.value }] }
      );

      $store.dispatch('questionnaire/updateCardIndex', { type: INCREMENT });
    };

    const selectedAnswerNumber = computed(() => {
      let answerListCard = [];
      if (card.value.isQuestionAnswerMultipleChoiced) {
        answerListCard = multipleSelectionList.value.filter(val => !!val);
      }

      if (singleSelection.value) answerListCard.push(singleSelection.value);

      return answerListCard.length;
    });

    const isRequired = computed(() => get(card.value, 'isMandatory') || false);

    const rules = computed(() => ({ selectedAnswerNumber: { ...isRequired.value && { minValue: minValue(1) } } }));
    const v$ = useVuelidate(rules, { selectedAnswerNumber });

    const answerList = computed(() => $store.state.questionnaire.answerList);

    const created = () => {
      const initialValue = answerList.value.find(a => a.card === card.value._id);

      if (initialValue) {
        if (card.value.isQuestionAnswerMultipleChoiced) {
          for (const asw of initialValue.answerList) {
            const index = card.value.qcAnswers.findIndex(a => a._id === asw);
            multipleSelectionList.value[index] = true;
          }
        } else {
          singleSelection.value = initialValue.answerList[0];
        }
      }
    };

    created();

    return {
      // Data
      multipleSelectionList,
      singleSelection,
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
.title
  color: $copper-grey-500
  font-size: 14px
.answers
  display: flex
  flex-direction: column
  padding: 0 0 0 4px
</style>
