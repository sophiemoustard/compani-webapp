<template>
  <div class="container">
    <q-linear-progress class="linear-progress" size="8px" :value="value" color="primary" />
    <a class="q-mx-md percentage">{{ percentage }}</a>
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
  display: ruby

.linear-progress
  width: 104px
  border-radius: 100px
  background-color: $primary-light
</style>
