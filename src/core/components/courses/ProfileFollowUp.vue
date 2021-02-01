<template>
  <div>
    <p class="text-weight-bold">Rapport d'utilisation</p>
    <div class="row">
      <div class="col-md-6 col-xs-12">
        <q-card flat class="q-pa-md right-stats">
          <div class="text-weight-bold q-mb-sm">Vue globale</div>
          <div class="row">
            <div class="col-3 text-right q-pr-md column justify-around">
              <ni-e-learning-indicator :indicator="traineesOnGoingCount" />
              <ni-e-learning-indicator :indicator="traineesFinishedCount" />
            </div>
            <div class="col-9 column justify-around">
              <div>apprenant{{ traineesOnGoingCount > 1 ? 's' : '' }} en cours</div>
              <div>apprenant{{ traineesFinishedCount > 1 ? 's' : '' }} ayant terminé</div>
            </div>
          </div>
        </q-card>
      </div>
    </div>
    <trainee-follow-up-table :learners.sync="learners" :profile-id="profileId" class="q-mt-xl" />
  </div>
</template>

<script>
import ELearningIndicator from '@components/courses/ELearningIndicator';
import TraineeFollowUpTable from '@components/courses/TraineeFollowUpTable';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-e-learning-indicator': ELearningIndicator,
    'trainee-follow-up-table': TraineeFollowUpTable,
  },
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
      learners: [],
    };
  },
  computed: {
    traineesOnGoingCount () {
      return this.learners.filter(l => l.progress !== 1).length;
    },
    traineesFinishedCount () {
      return this.learners.length - this.traineesOnGoingCount;
    },
  },
};
</script>
