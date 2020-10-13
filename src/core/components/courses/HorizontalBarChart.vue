<template>
  <div>
    <q-linear-progress size="48px" :value="0.5" rounded class="q-mt-sm bar">
      <div class="bar-label">
        <div>Un reseau wifi</div>
        <div>12 réponses</div>
      </div>
    </q-linear-progress>
  </div>
</template>

<script>
export default {
  name: 'HorizontalBarChart',
  data () {
    return {
    };
  },
};
</script>

<style lang="stylus" scoped>
.bar
  color: $middle-beige
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
