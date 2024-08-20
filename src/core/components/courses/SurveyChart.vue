<template>
  <q-card class="card" flat>
    <div class="text-weight-bold">{{ card.question }}</div>
    <div class="q-mb-lg subtitle">{{ subtitle }}</div>
    <div class="container">
      <div class="info-container">
        <div class="bar-container">
          <div v-for="(line, index) in lines" :key="index">
            <div class="bar bg-peach-100">
              <div class="bar-fill bg-peach-200" :style="`height: ${line.percentage * 100}%`" />
              <div class="q-mt-sm bar-label">{{ index + 1 }}</div>
            </div>
            <div class="percentage">{{ formatPercentage(line.percentage) }}</div>
          </div>
        </div>
        <div class="labels-container">
          <ni-labels-details are-details-visible :labels="card.labels" />
        </div>
      </div>
    </div>
  </q-card>
</template>

<script>
import { toRefs, computed } from 'vue';
import { formatQuantity, roundFrenchPercentage } from '@helpers/utils';
import LabelsDetails from '@components/LabelsDetails';

export default {
  name: 'SurveyChart',
  props: {
    card: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-labels-details': LabelsDetails,
  },
  setup (props) {
    const { card } = toRefs(props);

    const subtitle = computed(() => `${formatQuantity('réponse', card.value.answers.length)} à ce sondage`);

    const lines = computed(() => ['1', '2', '3', '4', '5'].map((pa) => {
      const total = card.value.answers.filter(a => a === pa).length;

      return { title: pa, total, percentage: total / card.value.answers.length || 0 };
    }));

    const formatPercentage = number => roundFrenchPercentage(number * 100, 0);

    return {
      // Computed
      subtitle,
      lines,
      // Methods
      formatPercentage,
    };
  },
};
</script>

<style lang="sass" scoped>
.card
  padding: 16px 32px

.subtitle
  color: $copper-grey-800
  font-size: 14px

.percentage
  text-align: center
  @media screen and (max-width: 420px)
    font-size: 12px

.bar-container
  display: flex
  justify-content: space-between
  width: 312px
  @media screen and (max-width: 420px)
    width: 100%
  align-items: center

.bar
  position: relative
  border-radius: 8px
  width: 56px
  height: 160px
  @media screen and (max-width: 420px)
    width: 32px

.first-label
  width: 30%

.last-label
  width: 30%
  text-align: right

.bar-fill
  position: absolute
  border-radius: 8px
  bottom: 0px
  width: 100%

.bar-label
  position: absolute
  font-size: 16px
  text-align: center
  width: 100%

.container
  container-type: inline-size

.info-container
  display: flex
  flex: 1
  justify-content: space-around
  align-items: center
  @container (max-width: 767px)
    flex-direction: column

.labels-container
  width: 30vw
  @container (min-width: 767px )
    width: 40vw
  @container (max-width: 250px)
    width: 60vw
</style>
