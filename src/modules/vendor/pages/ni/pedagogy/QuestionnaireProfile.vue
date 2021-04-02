<template>
  <q-page padding class="vendor-background" />
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'QuestionnaireProfile',
  props: {
    questionnaireId: { type: String, required: true },
  },
  computed: {
    ...mapState('questionnaire', ['questionnaire']),
  },
  async created () {
    await this.refreshQuestionnaire();
  },
  methods: {
    async refreshQuestionnaire () {
      await this.$store.dispatch('questionnaire/fetchQuestionnaire', { questionnaireId: this.questionnaireId });
    },
  },
};
</script>
