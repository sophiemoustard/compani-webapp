<template>
  <div class="card-container">
    {{ card.question }}
    <q-rating v-model="answer" :icon="iconTab" max="5" color="primary" size="xl" class="q-my-lg">
      <template #tip-1>
        <q-tooltip>{{ card.label.left }}</q-tooltip>
      </template>
      <template #tip-5>
        <q-tooltip>{{ card.label.right }}</q-tooltip>
      </template>
    </q-rating>
    <ni-footer label="Suivant" @submit="updateQuestionnaireAnswer" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { ref, toRefs } from 'vue';
import { INCREMENT } from '@data/constants';
import Footer from '@components/questionnaires/cards/Footer';

export default {
  name: 'Survey',
  components: {
    'ni-footer': Footer,
  },
  props: {
    card: { type: Object, required: true },
  },
  setup (props) {
    const { card } = toRefs(props);
    const $store = useStore();
    const answer = ref(0);
    const iconTab = ref([
      'mdi-numeric-1-box',
      'mdi-numeric-2-box',
      'mdi-numeric-3-box',
      'mdi-numeric-4-box',
      'mdi-numeric-5-box',
    ]);

    const updateQuestionnaireAnswer = () => {
      $store.dispatch(
        'questionnaire/setAnswerList',
        { answers: [{ card: card.value._id, answerList: [answer.value.toString()] }] }
      );

      $store.dispatch('questionnaire/updateCardIndex', { type: INCREMENT });
    };

    return {
      // Data
      answer,
      iconTab,
      // Methods
      updateQuestionnaireAnswer,
    };
  },
};
</script>
