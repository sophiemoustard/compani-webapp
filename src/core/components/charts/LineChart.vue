<template>
  <div>
    <q-card flat class="q-pa-md">
      <div class="text-weight-bold q-mb-md">{{ title }}</div>
      <!-- <line-chart :chart-data="chartData" :options="options" class="line-chart" /> -->
    </q-card>
  </div>
</template>

<script>
// import LineChart from '@components/charts/VueChartLineChart';

export default {
  name: 'LineChart',
  components: {
    // 'line-chart': LineChart,
  },
  props: {
    title: { type: String, required: true },
    chartData: { type: Object, required: true },
    options: {
      type: Object,
      default: () => ({
        responsive: true,
        maintainAspectRatio: false,
        scales: { yAxes: [{ ticks: { beginAtZero: true } }] },
        legend: { display: false },
      }),
    },
  },
};
</script>

<style lang="sass" scoped>
.line-chart
  max-height: 200px
</style>
