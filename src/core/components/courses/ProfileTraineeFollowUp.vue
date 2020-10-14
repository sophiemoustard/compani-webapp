<template>
  <div v-if="followUp.subProgram">
    <div v-for="(step, stepIndex) of followUp.subProgram.steps" :key="stepIndex" class="q-mb-xl">
      <div class="text-weight-bold">{{ stepIndex + 1 }} - {{ step.name }}</div>
    </div>
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
  data () {
    return {
      followUp: {},
    };
  },
  async created () {
    await this.refreshFollowUp();
  },
  methods: {
    async refreshFollowUp () {
      try {
        this.followUp = await Courses.getFollowUp(this.profileId);
      } catch (e) {
        this.followUp = {};
        NotifyNegative('Erreur lors de la récupération du suivi des stagiaires.');
        console.error(e);
      }
    },
  },
};
</script>
