<template>
  <div class="card-container">
    <div class="test-square" v-for="(card, index) in cards" :key="index" >toto</div>
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
  @media screen and (min-width: 768px)
    width: 33%
  @media screen and (max-width: 767px)
    min-width: 250px

.test-square
  background-color: $green;
  height: 150px
  width: 200px
  margin: 4px
</style>
