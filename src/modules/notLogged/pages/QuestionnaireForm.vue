<template>
  <div>
    <compani-header />
    <div class="row justify-center client-background">
      Merci ! A tres vite pour une formation
    </div>
  </div>
</template>

<script>
import { useMeta } from 'quasar';
import CompaniHeader from '@components/CompaniHeader';

export default {
  name: 'QuestionnaireForm',
  props: {
    questionnaireId: { type: String, required: true },
    courseId: { type: String, required: true },
  },
  components: {
    'compani-header': CompaniHeader,
  },
  setup () {
    const metaInfo = { title: 'Formulaire de réponse au questionnaire' };
    useMeta(metaInfo);

    return {
    };
  },
};
</script>

<style lang="sass" scoped>
.client-background
  min-height: 100vh
  @media screen and (max-width: 768px)
    height: 85vh
</style>
