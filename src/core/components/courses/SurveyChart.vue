<template>
  <horizontal-bar-chart :title="card.question" :subtitle="subtitle" :lines="lines" />
</template>

<script>
import HorizontalBarChart from '@components/courses/HorizontalBarChart';

export default {
  name: 'SurveyChart',
  components: {
    'horizontal-bar-chart': HorizontalBarChart,
  },
  props: {
    card: { type: Object, default: () => ({}) },
  },
  computed: {
    subtitle () {
      return `${this.card.answers.length} réponse${this.card.answers.length > 1 ? 's' : ''} à ce sondage`;
    },
    lines () {
      return ['1', '2', '3', '4', '5'].map((pa) => {
        const total = this.card.answers.filter(a => a === pa).length;

        return { title: pa, total, percentage: total / this.card.answers.length };
      });
    },
  },
};
</script>
