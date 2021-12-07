<template>
  <q-card class="card" flat>
    <div class="text-weight-bold">{{ card.question }}</div>
    <div class="q-mb-lg subtitle">{{ subtitle }}</div>
    <div v-for="(line, index) in lines" :key="index" class="q-mt-sm bar-container">
      <div class="q-mr-sm percentage">{{ formatPercentage(line.percentage) }}</div>
      <q-linear-progress size="40px" :value="line.percentage" rounded class="text-peach-200 bg-peach-100">
        <div class="bar-label">
          <div>{{ line.title }}</div>
          <div><span class="text-weight-bold">{{ line.total }}</span> réponses</div>
        </div>
      </q-linear-progress>
    </div>
  </q-card>
</template>

<script>
import { roundFrenchPercentage } from '@helpers/utils';

export default {
  name: 'QuestionAnswerChart',
  props: {
    card: { type: Object, default: () => ({}) },
  },
  computed: {
    subtitle () {
      return `${this.card.answers.length} réponses à cette question à choix
        ${this.card.isQuestionAnswerMultipleChoiced ? 'multiple' : 'simple'}`;
    },
    lines () {
      return this.card.qcAnswers.map((pa) => {
        const total = this.card.answers.filter(a => a === pa._id).length;

        return { title: pa.text, total, percentage: total / this.card.answers.length || 0 };
      });
    },
  },
  methods: {
    formatPercentage (number) {
      return roundFrenchPercentage(number * 100, 0);
    },
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
  width: 56px

.bar-container
  display: flex
  align-items: center

::v-deep .q-linear-progress__track
  opacity: 0

.bar-label
  font-size: 14px
  position: absolute
  color: $copper-grey-700
  display: flex
  justify-content: space-between
  width: 100%
  align-items: center
  height: 100%
  padding: 0 24px
</style>
