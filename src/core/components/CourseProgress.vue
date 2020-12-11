<template>
  <div class="row no-wrap container">
    <q-linear-progress class="linear-progress" size="8px" :value="value" color="primary" />
    <div class="q-mx-xs percentage">{{ percentage }}</div>
  </div>
</template>

<script>
import { roundFrenchPercentage } from '@helpers/utils';

export default {
  name: 'Progress',
  props: {
    value: { type: Number, default: 0 },
  },
  computed: {
    percentage () {
      return roundFrenchPercentage(this.value * 100, 0);
    },
  },
};
</script>

<style lang="stylus" scoped>
.container
  justify-content: center;
  align-items: center;

@media (min-width: 767px)
  .linear-progress
    border-radius: 100px
    background-color: $primary-light

.percentage
  color: $primary
  width: 60px
</style>
