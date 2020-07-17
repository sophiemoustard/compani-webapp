<template>
  <div class="card-container">
    <div class="card-cell" v-for="(card, index) in cards" :key="index" >Transition</div>
    <q-icon name="add" size="35px" color="primary" @click="openCreationModal"/>
  </div>
</template>

<script>
export default {
  name: 'CardContainer',
  props: {
    cards: { type: Array, default: () => [] },
  },
  methods: {
    openCreationModal () {
      this.$emit('openCreationModal');
    },
  },
}
</script>

<style lang="stylus" scoped>
.card-container
  padding: 10px
  border-radius: 3px
  background-color: $white
  display: flex;
  flex-direction: column
  align-items: center;

.card-cell
  background-color: $primary-light;
  height: 150px
  width: 100%
  margin: 4px
</style>
