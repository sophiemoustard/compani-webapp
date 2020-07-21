<template>
  <div class="card-container">
    <div class="card-cell" v-for="(card, index) in cards" :key="index" >
      <div class="card-cell-title text-weight-bold">
        {{ index + 1 }}.
      </div>
      <div>{{ getTemplateName(card.template) }}</div>
    </div>
    <q-icon name="add" size="35px" color="primary" @click="openCreationModal"/>
  </div>
</template>

<script>
import { TEMPLATE_TYPES } from '@data/constants';
export default {
  name: 'CardContainer',
  props: {
    cards: { type: Array, default: () => [] },
  },
  methods: {
    openCreationModal () {
      this.$emit('add');
    },
    getTemplateName (value) {
      const template = TEMPLATE_TYPES.find(t => t.value === value);
      return template ? `Carte cours - ${template.label}` : '';
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
  align-items: center

.card-cell
  background-color: $primary-light
  border-radius: 4px
  @media screen and (min-width: 768px)
    height: 110px
  @media screen and (max-width: 767px)
    height: 90px
  width: 100%
  margin: 4px
  padding: 7px
  &-title
    margin-bottom: 10px
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
</style>
