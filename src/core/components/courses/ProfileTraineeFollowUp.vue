<template>
  <div>
    <horizontal-bar-chart />
  </div>
</template>

<script>
import { NotifyNegative } from '@components/popup/notify';
import HorizontalBarChart from '@components/courses/HorizontalBarChart';
import Courses from '@api/courses';

export default {
  name: 'ProfileTraineeFollowUp',
  components: {
    'horizontal-bar-chart': HorizontalBarChart,
  },
  props: {
    profileId: { type: String, required: true },
  },
  async created () {
    await this.refreshFollowUp();
  },
  methods: {
    async refreshFollowUp () {
      try {
        await Courses.getFollowUp(this.profileId);
      } catch (e) {
        NotifyNegative('Erreur lors de la récupération du suivi des stagiaires.');
        console.error(e);
      }
    },
  },
};
</script>
