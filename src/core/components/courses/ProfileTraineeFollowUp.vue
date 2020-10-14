<template>
  <div v-if="followUp.subProgram">
    <div v-for="(step, stepIndex) of followUp.subProgram.steps" :key="stepIndex" class="q-mb-xl">
      <div class="text-weight-bold q-mb-sm">{{ stepIndex + 1 }} - {{ step.name }}</div>
      <q-card v-for="(activity, activityIndex) of step.activities" :key="activityIndex" flat class="q-mb-sm">
        <q-card-section class="cursor-pointer" @click="showCards(activity._id)">
          <div class="text-weight-bold">{{ activityIndex + 1 }} - {{ activity.name }}</div>
        </q-card-section>
        <div class="beige-background">
          <template v-if="areCardsDisplayed[activity._id]">
            <div v-for="(card, cardIndex) of activity.followUp" :key="cardIndex">
              <div>{{ card.question }}</div>
            </div>
          </template>
        </div>
      </q-card>
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
      areCardsDisplayed: {},
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
    showCards (activityId) {
      this.$set(this.areCardsDisplayed, activityId, !this.areCardsDisplayed[activityId]);
    },
  },
};
</script>
