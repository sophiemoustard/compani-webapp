<template>
  <q-card class="q-mb-md q-pa-lg">
    <span class="title">{{ item.question }}</span>
    <survey-labels-details :labels="item.labels" />
    <div class="row">
      <survey-answer title="Note de début" :answer="item.answers['startCourse'] || ''" />
      <survey-answer title="Note de fin" :answer="item.answers['endCourse'] || ''" />
    </div>
  </q-card>
</template>

<script>
import SurveyLabelsDetails from './SurveyLabelsDetails';
import SurveyAnswer from './SurveyAnswer';

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
</style>
