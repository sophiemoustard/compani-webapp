<template>
  <div>
    <horizontal-bar-chart />
  </div>
</template>

<script>
import HorizontalBarChart from '@components/courses/HorizontalBarChart';

export default {
  name: 'ProfileTraineeFollowUp',
  components: {
    'horizontal-bar-chart': HorizontalBarChart,
  },
};
</script>
