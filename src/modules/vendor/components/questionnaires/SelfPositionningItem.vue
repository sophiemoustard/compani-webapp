<template>
  <q-card class="q-mb-md q-pa-lg">
    <span class="title">{{ item.question }}</span>
    <survey-labels-details :labels="item.labels" />
    <div class="answers">
      <survey-answer title="Note de début" :answer="item.answers['startCourse'] || ''" />
      <survey-answer title="Note de fin" :answer="item.answers['endCourse'] || ''" />
      <div class="flex column justify-end q-pa-md">
        <q-checkbox v-if="item.answers['endCourse']" :model-value="validation" label="Je valide la note de fin"
          keep-color color="peach-200" @update:model-value="updateValidation" />
      </div>
    </div>
  </q-card>
</template>

<script>
import { ref, toRefs } from 'vue';
import SurveyLabelsDetails from 'src/modules/vendor/components/questionnaires/SurveyLabelsDetails';
import SurveyAnswer from 'src/modules/vendor/components/questionnaires/SurveyAnswer';

export default {
  name: 'SurveyItem',
  props: {
    item: { type: Object, required: true },
  },
  components: {
    'survey-labels-details': SurveyLabelsDetails,
    'survey-answer': SurveyAnswer,
  },
  emits: ['update-trainer-answers'],
  setup (props, { emit }) {
    const { item } = toRefs(props);
    const validation = ref(false);

    const updateValidation = () => {
      validation.value = !validation.value;
      emit('update-trainer-answers', { card: item.value.card, isValidated: validation.value });
    };

    return {
      // Data
      validation,
      // Method
      updateValidation,
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
</style>
