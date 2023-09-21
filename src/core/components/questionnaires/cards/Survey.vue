<template>
  <div class="card-container">
    <span>
      {{ card.question }}
      <span v-if="isRequired"> *</span>
    </span>
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
import { ref, toRefs, computed } from 'vue';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { minValue } from '@vuelidate/validators';
import { NotifyWarning } from '@components/popup/notify';
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

    const isRequired = computed(() => get(card.value, 'isMandatory') || false);

    const rules = computed(() => ({ answer: { ...(isRequired.value && { minValue: minValue(1) }) } }));
    const v$ = useVuelidate(rules, { answer });

    const updateQuestionnaireAnswer = () => {
      v$.value.answer.$touch();
      if (v$.value.answer.$error) return NotifyWarning('Champ(s) invalide(s).');

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
      // Computed
      isRequired,
      // Methods
      updateQuestionnaireAnswer,
    };
  },
};
</script>
