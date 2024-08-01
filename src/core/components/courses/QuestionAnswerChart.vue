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
import { toRefs, computed } from 'vue';
import { roundFrenchPercentage } from '@helpers/utils';

export default {
  name: 'QuestionAnswerChart',
  props: {
    card: { type: Object, default: () => ({}) },
  },
  setup (props) {
    const { card } = toRefs(props);

    const subtitle = computed(() => `Question à choix
      ${card.value.isQuestionAnswerMultipleChoiced ? 'multiple' : 'simple'} : ${card.value.traineeCount} répondants
      pour ${card.value.historyCount} réponses`);

    const lines = computed(() => card.value.qcAnswers.map((pa) => {
      const total = card.value.answers.filter(a => a === pa._id).length;

      return { title: pa.text, total, percentage: total / card.value.answers.length || 0 };
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
  width: 56px

.bar-container
  display: flex
  align-items: center

:deep(.q-linear-progress__track)
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
