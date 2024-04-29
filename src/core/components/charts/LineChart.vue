<template>
  <div>
    <q-card flat class="q-pa-md">
      <div class="text-weight-bold q-mb-md">{{ title }}</div>
      <vue-chart-line-chart :options="options" :data="chartData" class="line-chart" />
    </q-card>
  </div>
</template>

<script>
import { getCssVar } from 'quasar';
import { toRefs, computed } from 'vue';
import { Line as VueChartLineChart } from 'vue-chartjs';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export default {
  name: 'LineChart',
  components: {
    'vue-chart-line-chart': VueChartLineChart,
  },
  props: {
    data: { type: Array, default: () => [] },
    labels: { type: Array, default: () => [] },
    title: { type: String, default: () => '' },
  },
  setup (props) {
    const { labels, data } = toRefs(props);

    const chartData = computed(() => ({
      labels: labels.value,
      datasets: [
        {
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

    return {
      // Computed
      options,
      chartData,
    };
  },
};
</script>

<style lang="sass" scoped>
.line-chart
  max-height: 200px
</style>
