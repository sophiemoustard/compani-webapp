<template>
  <div>
    <div v-for="(line, index) in lines" :key="index" class="q-mt-sm bar-container">
      <div class="q-mr-md">{{ line.percentage * 100 }}%</div>
      <q-linear-progress size="48px" :value="line.percentage" rounded class="bar">
        <div class="bar-label">
          <div>{{ line.title }}</div>
          <div><span class="text-weight-bold">{{ line.total }}</span> réponses</div>
        </div>
      </q-linear-progress>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HorizontalBarChart',
  data () {
    return {
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
