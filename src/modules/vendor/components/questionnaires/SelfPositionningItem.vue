<template>
  <q-card class="q-mb-md q-pa-lg">
    <span class="title">{{ item.question }}</span>
    <survey-labels-details :labels="item.labels" />
    <div class="answers">
      <survey-answer title="Note de début" :answer="item.answers['startCourse'] || ''" />
      <survey-answer title="Note de fin" :answer="item.answers['endCourse'] || ''" />
    </div>
  </q-card>
</template>

<script>
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
  setup () {
    return {
      // Data
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
