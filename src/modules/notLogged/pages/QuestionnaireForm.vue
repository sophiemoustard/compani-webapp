<template>
  <div>
    <compani-header />
    <div class="row justify-center client-background">
      Merci ! A tres vite pour une formation
    </div>
  </div>
</template>

<script>
import CompaniHeader from '@components/CompaniHeader';

export default {
  name: 'Questionnaire',
  props: {
    questionnaireId: { type: String, required: true },
    courseId: { type: String, required: true },
  },
  components: {
    'compani-header': CompaniHeader,
  },
  setup () {
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
