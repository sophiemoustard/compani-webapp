<template>
  <q-card class="q-mb-md q-pa-lg">
    <span class="title">{{ item.question }}</span>
    <survey-labels-details :labels="item.labels" />
    <div class="answers">
      <survey-answer title="Note de début" :answer="item.answers['startCourse'] || ''" />
      <survey-answer title="Note de fin" :answer="item.answers['endCourse'] || ''" />
      <div v-if="item.answers['endCourse']" class="flex column justify-end q-pa-md">
        <ni-button label="Ajuster la note" class="bg-primary" color="white" @click="openTrainerAnswerModal" />
        <q-checkbox :model-value="validation" label="Je valide la note de fin" keep-color color="primary"
          @update:model-value="() => updateTrainerAnswers(VALIDATE)" />
      </div>
    </div>
  </q-card>
  <trainer-answer-modal v-model="trainerAnswerModal" :trainer-answer="trainerAnswer" :labels="item.labels"
    :question="item.question" :validations="v$.trainerAnswer" @hide="closeTrainerAnswerModal"
    @submit="(answer) => updateTrainerAnswers(ADJUST, answer)" />
</template>

<script>
import { ref, toRefs, watch, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import SurveyLabelsDetails from 'src/modules/vendor/components/questionnaires/SurveyLabelsDetails';
import SurveyAnswer from 'src/modules/vendor/components/questionnaires/SurveyAnswer';
import TrainerAnswerModal from 'src/modules/vendor/components/questionnaires/trainerAnswerModal';
import Button from '@components/Button';
import { NotifyWarning } from '@components/popup/notify';
import { ADJUST, VALIDATE } from '@data/constants';
import { strictPositiveNumber, integerNumber } from '@helpers/vuelidateCustomVal';

export default {
  name: 'SurveyItem',
  props: {
    item: { type: Object, required: true },
  },
  components: {
    'survey-labels-details': SurveyLabelsDetails,
    'survey-answer': SurveyAnswer,
    'ni-button': Button,
    'trainer-answer-modal': TrainerAnswerModal,
  },
  emits: ['update-trainer-answers'],
  setup (props, { emit }) {
    const { item } = toRefs(props);
    const validation = ref(false);
    const trainerAnswerModal = ref(false);
    const trainerAnswer = ref(0);

    const rules = computed(() => ({
      trainerAnswer: { required, strictPositiveNumber, integerNumber },
    }));
    const v$ = useVuelidate(rules, { trainerAnswer });

    watch(() => item.value.answers, () => { validation.value = false; });

    const openTrainerAnswerModal = () => { trainerAnswerModal.value = true; };

    const closeTrainerAnswerModal = () => {
      v$.value.trainerAnswer.$reset();

      trainerAnswerModal.value = false;
    };

    const updateTrainerAnswers = (type, answer = 0) => {
      if (type === ADJUST) {
        trainerAnswer.value = answer;

        v$.value.trainerAnswer.$touch();
        if (v$.value.trainerAnswer.$error) return NotifyWarning('Champ(s) invalide(s)');

        emit('update-trainer-answers', { card: item.value.card, answer: trainerAnswer.value });
      } else if (type === VALIDATE) {
        validation.value = !validation.value;
        emit('update-trainer-answers', { card: item.value.card, isValidated: validation.value });
      }

      closeTrainerAnswerModal();
    };

    return {
      // Data
      validation,
      trainerAnswerModal,
      VALIDATE,
      ADJUST,
      trainerAnswer,
      // Validations
      v$,
      // Methods
      updateTrainerAnswers,
      openTrainerAnswerModal,
      closeTrainerAnswerModal,
    };
  },
};
</script>

<style lang="sass" scoped>
.title
  font-size: 16px
  color: $copper-grey-700
.answers
  display: flex
  flex-direction: row
  @media screen and (max-width: 768px)
    flex-direction: column
:deep(.q-checkbox__label)
  opacity: 1
  color: $primary
</style>
