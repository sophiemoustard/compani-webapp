<template>
  <div class="card-list">
    <q-scroll-area ref="cardContainer" :thumb-style="{ width: '6px', 'border-radius': '10px' }"
      :content-style="{ display:'flex', 'flex-direction': 'column' }"
      :content-active-style="{ display:'flex', 'flex-direction': 'column' }">
      <div v-for="(card, index) in cards" :key="index" :class="getCardStyle(card)">
        <div class="card-actions">
          <ni-button v-if="isSelected(card)" icon="delete" @click.native="deleteCard(card)" :disable="disableEdition" />
        </div>
        <div class="card-cell cursor-pointer" @click="selectCard(card)">
          <div class="card-cell-title">
            <div class="text-weight-bold">{{ index + 1 }}. {{ getHeading(card) }}</div>
            <q-icon v-if="disableEdition" name="lock" size="xs" :class="{'locked-unselected': !isSelected(card)}" />
          </div>
          <div>{{ getTemplateName(card.template) }}</div>
        </div>
        <div v-if="!isSelected(card) && cardValidation(card).error" :class="{ 'dot dot-error': true }" />
      </div>
    </q-scroll-area>
    <ni-button v-if="!disableEdition" label="Ajouter une carte" color="primary" icon="add" @click="openCreationModal" />
    <ni-button v-else label="Déverouiller l'activité" color="primary" icon="mdi-lock-outline" @click="unlockEdition" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import {
  CARD_TEMPLATES,
  TRANSITION,
  TITLE_TEXT,
  TITLE_TEXT_MEDIA,
  TEXT_MEDIA,
  FLASHCARD,
  TEMPLATE_TYPES,
} from '@data/constants';
import Button from '@components/Button';
import { cardValidation } from 'src/modules/vendor/helpers/cardValidation';

export default {
  name: 'CardContainer',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-button': Button,
  },
  computed: {
    ...mapState('program', ['card']),
    ...mapGetters({ cards: 'program/getCards' }),
  },
  methods: {
    cardValidation,
    getCardStyle (card) {
      return [
        'card-row',
        { 'card-row-selected': this.isSelected(card) && !this.disableEdition },
        { 'card-row-locked': !this.isSelected(card) && this.disableEdition },
        { 'card-row-locked-selected': this.isSelected(card) && this.disableEdition },
      ];
    },
    isSelected (card) {
      if (!this.card) return false;
      return card._id === this.card._id;
    },
    openCreationModal () {
      this.$emit('add');
    },
    getHeading (card) {
      if ([TRANSITION, TITLE_TEXT_MEDIA, TITLE_TEXT].includes(card.template)) return card.title || '';
      if ([FLASHCARD, TEXT_MEDIA].includes(card.template)) return card.text || '';
      return '';
    },
    getTemplateName (value) {
      const template = CARD_TEMPLATES.find(t => t.value === value);
      return template ? `Carte ${TEMPLATE_TYPES[template.type].toLowerCase()} - ${template.label}` : '';
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
    deleteCard (card) {
      this.$emit('delete-card', card._id);
    },
    unlockEdition () {
      this.$emit('unlock-edition');
    },
  },
};
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
  justify-content: flex-start
  &-selected
    justify-content: flex-end
    .card-cell
      background-color: $light-purple
  &-locked
    .card-cell
      background-color: $light-grey
  &-locked-selected
    .card-cell
      background-color: $dark-grey
      color: $white
  .dot
    margin: 0 0 0 3px

.card-actions
  display: flex
  flex-direction: column
.locked-unselected
  color: $grey

.card-cell
  background-color: $primary-light
  border-radius: 4px
  height: fit-content
  @media screen and (min-width: 768px)
    min-height: 90px
  @media screen and (max-width: 767px)
    min-height: 80px
  width: 85%
  padding: 7px
  &-title
    display: flex
    justify-content: space-between
    > div
      margin-bottom: 5px
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis

.dot-error
  align-self: center
</style>
