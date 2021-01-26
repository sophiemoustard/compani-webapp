<template>
  <q-page class="vendor-background" padding>
    {{ questionnaireAnswers }}
  </q-page>
</template>

<script>
import Courses from '@api/Courses';

export default {
  name: 'QuestionnaireAnswers',
  props: {
    courseId: { type: String, required: true },
    activityId: { type: String, required: true },
  },
  data () {
    return {
      questionnaireAnswers: [],
    };
  },
  async created () {
    await this.refreshAnswers();
  },
  methods: {
    async refreshAnswers () {
      try {
        this.questionnaireAnswers = await Courses.getQuestionnaireAnswers(this.courseId, { activity: this.activityId });
      } catch (e) {
        console.error(e);
        this.questionnaireAnswers = [];
      }
    },
  },
};
</script>
