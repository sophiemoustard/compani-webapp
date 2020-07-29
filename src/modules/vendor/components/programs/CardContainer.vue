<template>
  <div class="card-list">
    <q-scroll-area ref="cardContainer" :thumb-style="{ width: '6px', 'border-radius': '10px' }"
      :content-style="{ display:'flex', 'flex-direction': 'column' }"
      :content-active-style="{ display:'flex', 'flex-direction': 'column' }">
      <div v-for="(card, index) in cards" :key="index" :class="['card-row', { 'card-row-selected': isSelected(card) }]">
        <div :class="['card-cell', 'cursor-pointer', { 'card-cell-selected': isSelected(card) }]"
           @click="selectCard(card)">
          <div class="card-cell-title text-weight-bold">
            {{ index + 1 }}. {{ getHeading(card) }}
          </div>
          <div>{{ getTemplateName(card.template) }}</div>
        </div>
        <div v-if="!isSelected(card) && cardValidation(card).error" :class="{ 'dot dot-error': true }" />
      </div>
    </q-scroll-area>
    <q-btn no-caps flat class="q-my-xs" label="Ajouter une carte" color="primary" icon-right="add"
      @click="openCreationModal" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import { TEMPLATE_TYPES } from '@data/constants';
import { cardValidation } from 'src/modules/vendor/helpers/cardValidation';

export default {
  name: 'CardContainer',
  computed: {
    ...mapState('program', ['card']),
    ...mapGetters({ cards: 'program/getCards' }),
  },
  methods: {
    cardValidation,
    isSelected (card) {
      if (!this.card) return false;
      return card._id === this.card._id;
    },
    openCreationModal () {
      this.$emit('add');
    },
    getHeading (card) {
      if (card.title) return card.title;
      return card.text;
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
.card-list
  padding: 5px 5px 0 5px
  border-radius: 3px
  background-color: $white
  display: flex
  flex-direction: column

.q-scrollarea
  height: 100%

.card-row
  margin: 4px
  display: flex
  align-items: center
  justify-content: flex-start
  &-selected
    justify-content: flex-end
    .card-cell
      background-color: $light-purple
  .dot
    margin: 0 0 0 3px

.card-cell
  background-color: $primary-light
  border-radius: 4px
  @media screen and (min-width: 768px)
    height: 90px
  @media screen and (max-width: 767px)
    height: 80px
  width: 85%
  padding: 7px
  &-title
    margin-bottom: 5px
    white-space: nowrap
    overflow: hidden
    text-overflow: ellipsis
</style>
