<template>
  <q-card class="q-mb-md q-pa-lg">
    <span class="title">{{ item.question }}</span>
    <survey-labels-details :labels="item.labels" />
    <div class="answers">
      <survey-answer title="Note de début" :answer="Number(item.answers.startCourse) || 0" />
      <survey-answer title="Note de fin" :answer="Number(item.answers.endCourse) || 0" />
      <div v-if="displayReviewButtons" class="flex column justify-end q-pa-md">
        <ni-button label="Ajuster la note" class="bg-primary" color="white" @click="openTrainerReviewModal" />
        <q-checkbox class="q-py-sm" :model-value="trainerValidation" label="Je valide la note de fin"
          keep-color color="primary" @update:model-value="() => updateTrainerReview(VALIDATE)" />
      </div>
      <template v-else>
        <survey-answer v-if="trainerAnswer" title="Note ajustée" :answer="trainerAnswer" />
        <div v-else-if="trainerValidation" class="validate">
          <q-icon class="q-py-xs q-pr-md" name="check" />
          <span>La note de fin est validée</span>
        </div>
      </template>
    </div>
  </q-card>
  <trainer-review-modal v-model="trainerReviewModal" :trainer-answer="trainerAnswer" :labels="item.labels"
    :question="item.question" :validations="v$.trainerAnswer" @hide="closeTrainerReviewModal"
    @submit="(answer) => updateTrainerReview(ADJUST, answer)" />
</template>

<script>
import { ref, toRefs, watch, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import SurveyLabelsDetails from 'src/modules/vendor/components/questionnaires/SurveyLabelsDetails';
import SurveyAnswer from 'src/modules/vendor/components/questionnaires/SurveyAnswer';
import TrainerReviewModal from 'src/modules/vendor/components/questionnaires/TrainerReviewModal';
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
    'trainer-review-modal': TrainerReviewModal,
  },
  emits: ['update-trainer-review'],
  setup (props, { emit }) {
    const { item } = toRefs(props);
    const trainerValidation = ref(false);
    const trainerReviewModal = ref(false);
    const trainerAnswer = ref(0);

    const rules = computed(() => ({
      trainerAnswer: { required, strictPositiveNumber, integerNumber },
    }));
    const v$ = useVuelidate(rules, { trainerAnswer });

    const displayReviewButtons = computed(() => item.value.answers.endCourse &&
      !(trainerAnswer.value || trainerValidation.value));

    watch(() => item.value.answers, () => {
      trainerValidation.value = false;
      trainerAnswer.value = 0;
    });

    const openTrainerReviewModal = () => { trainerReviewModal.value = true; };

    const closeTrainerReviewModal = () => {
      v$.value.trainerAnswer.$reset();

      trainerReviewModal.value = false;
    };

    const updateTrainerReview = (type, answer = 0) => {
      if (type === ADJUST) {
        trainerAnswer.value = answer;

        v$.value.trainerAnswer.$touch();
        if (v$.value.trainerAnswer.$error) return NotifyWarning('Champ(s) invalide(s)');

        emit('update-trainer-review', { card: item.value.card, answer: trainerAnswer.value.toString() });
      } else if (type === VALIDATE) {
        trainerValidation.value = !trainerValidation.value;
        emit('update-trainer-review', { card: item.value.card, isValidated: trainerValidation.value });
      }

      closeTrainerReviewModal();
    };

    return {
      // Data
      trainerValidation,
      trainerReviewModal,
      VALIDATE,
      ADJUST,
      trainerAnswer,
      // Validations
      v$,
      // Computed
      displayReviewButtons,
      // Methods
      updateTrainerReview,
      openTrainerReviewModal,
      closeTrainerReviewModal,
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
.validate
  padding: 32px 8px
  display: flex
  justify-content: center
  align-items: end
  color: $primary
</style>
