<template>
  <div class="card-container">
    <q-scroll-area ref="cardContainer">
      <div :class="['card-cell', 'cursor-pointer', { 'card-cell-selected': isSelected(card) }]"
        v-for="(card, index) in cards" :key="index" @click="selectCard(card)">
        <div class="card-cell-title text-weight-bold">
          {{ index + 1 }}. {{ card.title }}
        </div>
        <div>{{ getTemplateName(card.template) }}</div>
      </div>
    </q-scroll-area>
    <q-btn no-caps flat class="q-my-sm" label="Ajouter une carte" color="primary" icon-right="add"
      @click="openCreationModal" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { TEMPLATE_TYPES } from '@data/constants';

export default {
  name: 'CardContainer',
  computed: {
    ...mapState('program', ['card']),
    ...mapGetters({ cards: 'program/getCards' }),
  },
  methods: {
    isSelected (card) {
      if (!this.card) return false;
      return card._id === this.card._id;
    },
    openCreationModal () {
      this.$emit('add');
    },
    getTemplateName (value) {
      const template = TEMPLATE_TYPES.find(t => t.value === value);
      return template ? `Carte cours - ${template.label}` : '';
    },
    scrollDown () {
      const scrollArea = this.$refs.cardContainer;
      const scrollTarget = scrollArea.getScrollTarget();
      const duration = 300;
      scrollArea.setScrollPosition(scrollTarget.scrollHeight, duration);
    },
    selectCard (card) {
      this.$store.dispatch('program/fetchCard', card);
    },
  },
}
</script>

<style lang="stylus" scoped>
.card-container
  padding: 5px 5px 0 5px
  border-radius: 3px
  background-color: $white
  display: flex
  flex-direction: column

.q-scrollarea
  height: 100%

/deep/.q-scrollarea__thumb
  width: 6px
  border-radius: 10px

.card-cell
  background-color: $primary-light
  border-radius: 4px
  @media screen and (min-width: 768px)
    height: 110px
  @media screen and (max-width: 767px)
    height: 90px
  width: 85%
  margin: 4px
  padding: 7px
  &-selected
    background-color: $light-purple
  &-title
    margin-bottom: 10px
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
</style>
