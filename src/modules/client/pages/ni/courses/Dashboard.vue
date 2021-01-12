<template>
  <q-page class="client-background q-pb-xl" padding>
    <div class="title-padding">
      <h4>La formation Compani dans ma structure</h4>
    </div>
    <q-card flat class="row q-pa-md">
      <div class="col-6">
        <div class="text-weight-bold">Le e-learning dans ma structure</div>
        <ni-date-range :value="dates" />
      </div>
      <div class="col-6 elearning">
        <div class="elearning-item">
          <div class="elearning-indicator text-weight-bold text-pink-500">23</div>
          <div>apprenants actifs</div>
        </div>
        <div class="elearning-item">
          <div class="elearning-indicator text-weight-bold text-pink-500">214</div>
          <div>activités de eLearning réalisées</div>
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script>
import DateRange from '@components/form/DateRange';
import moment from '@helpers/moment';

export default {
  name: 'CourseDashboard',
  metaInfo: { title: 'Tableau de bord des formations' },
  components: {
    'ni-date-range': DateRange,
  },
  data () {
    return {
      dates: {
        startDate: moment().subtract(30, 'd').startOf('d').toISOString(),
        endDate: moment().toISOString(),
      },
    };
  },
};
</script>

<style lang="stylus" scoped>
.elearning
  display: flex
  flex-direction: row
  justify-content: space-around

.elearning-item
  display: flex
  flex-direction: column
  align-items: center

.elearning-indicator
  font-size: 36px

</style>
