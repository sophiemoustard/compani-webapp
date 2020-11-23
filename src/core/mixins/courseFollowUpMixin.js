export const courseFollowUpMixin = {
  methods: {
    getCourseProgress (steps) {
      return steps.reduce((acc, s) => s.progress + acc, 0) / steps.length;
    },
  },
};
