<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Questionnaires" class="q-mb-xl" />
    <questionnaire-container />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import TitleHeader from '@components/TitleHeader';
import QuestionnaireContainer from '@components/questionnaires/QuestionnaireContainer';

export default {
  name: 'QuestionnairesDirectory',
  components: {
    'ni-title-header': TitleHeader,
    'questionnaire-container': QuestionnaireContainer,
  },
  setup () {
    const metaInfo = { title: 'Questionnaires' };
    useMeta(metaInfo);

    return {};
  },
};
</script>
