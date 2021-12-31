<template>
  <div>
    <q-card flat class="q-pa-md">
      <div class="text-weight-bold q-mb-md">{{ title }}</div>
      <LineChart v-bind="lineChartProps" class="line-chart" />
    </q-card>
  </div>
</template>

<script>
import { getCssVar } from 'quasar';
import { toRefs, computed } from 'vue';
import { LineChart, useLineChart } from 'vue-chart-3';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'NiLineChart',
  components: { LineChart },
  props: {
    data: { type: Array, default: () => ([]) },
    labels: { type: Array, default: () => ([]) },
    title: { type: String, default: () => '' },
  },
  setup (props) {
    const { labels, data } = toRefs(props);

    const chartData = computed(() => ({
      labels: labels.value,
      datasets: [
        {
          label: 'Bitcoin',
          data: data.value,
          fill: false,
          borderColor: getCssVar('primary'),
          backgroundColor: 'transparent',
          lineTension: 0.3,
        },
      ],
    }));

    const options = computed(() => ({
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } },
      responsive: true,
      maintainAspectRatio: false,
    }));

    const { lineChartProps } = useLineChart({
      options,
      chartData,
    });

    return {
      lineChartProps,
    };
  },
};
</script>

<style lang="sass" scoped>
.line-chart
  max-height: 200px
</style>
