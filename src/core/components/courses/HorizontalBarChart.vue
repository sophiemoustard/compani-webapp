<template>
  <q-card class="card">
    <div class="text-weight-bold">{{ title }}</div>
    <div class="q-mb-lg subtitle">{{ subtitle }}</div>
    <div v-for="(line, index) in lines" :key="index" class="q-mt-sm bar-container">
      <div class="q-mr-md">{{ line.percentage * 100 }}%</div>
      <q-linear-progress size="48px" :value="line.percentage" rounded class="bar">
        <div class="bar-label">
          <div>{{ line.title }}</div>
          <div><span class="text-weight-bold">{{ line.total }}</span> réponses</div>
        </div>
      </q-linear-progress>
    </div>
  </q-card>
</template>

<script>
export default {
  name: 'HorizontalBarChart',
  data () {
    return {
      title: 'Quels sont vos outils (mail, messagerie interne, messenger...) pour communiquer ?',
      subtitle: '15 réponses à cette question à choix multiple',
      lines: [
        { title: 'hello', total: 9, percentage: 0.2 },
        { title: 'hello', total: 9, percentage: 0.2 },
        { title: 'hello', total: 9, percentage: 0.2 },
        { title: 'hello', total: 9, percentage: 0.2 },
        { title: 'hello', total: 9, percentage: 0.2 },
      ],
    };
  },
};
</script>

<style lang="stylus" scoped>
.card
  padding: 16px 32px

.subtitle
  color: $dark-grey
  font-size: 14px

.bar
  color: $middle-beige

.bar-container
  display: flex
  align-items: center

.bar-label
  font-size: 14px
  position: absolute
  color: black
  display: flex
  justify-content: space-between
  width: 100%
  align-items: center
  height: 100%
  padding: 0 24px
</style>
