<template>
  <div class="card-list">
    <q-scroll-area ref="cardContainer" :thumb-style="{ width: '6px', 'border-radius': '10px' }"
      :content-style="{ display:'flex', 'flex-direction': 'column' }"
      :content-active-style="{ display:'flex', 'flex-direction': 'column' }">
      <draggable v-model="draggableCards" @change="dropCard()" ghost-class="ghost" :disabled="isDraggableDisabled">
        <div v-for="(card, index) in draggableCards" :key="index" :class="getCardStyle(card)">
          <div class="card-actions">
            <ni-button v-if="isSelected(card) && !isActivityPublished" icon="delete" @click="deleteCard(card)"
              :disable="disableEdition" />
          </div>
          <div class="card-cell cursor-pointer" @click="selectCard(card)">
            <div class="card-cell-title">
              <div class="text-weight-bold">{{ index + 1 }}. {{ getHeading(card) }}</div>
              <q-icon v-if="disableEdition" name="lock" size="xs" :class="{'locked-unselected': !isSelected(card)}" />
            </div>
            <div>{{ getTemplateName(card.template) }}</div>
          </div>
          <div v-if="!isSelected(card) && !card.isValid" :class="{ 'dot dot-error': true }" />
        </div>
      </draggable>
    </q-scroll-area>
    <ni-button v-if="disableEdition" label="Déverouiller l'activité" color="primary" icon="mdi-lock-outline"
      @click="unlockEdition" />
    <ni-button v-else-if="!isActivityPublished" label="Ajouter une carte" color="primary" icon="add"
      @click="openCreationModal" />
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex';
import cloneDeep from 'lodash/cloneDeep';
import draggable from 'vuedraggable';
import {
  CARD_TEMPLATES,
  TRANSITION,
  TITLE_TEXT,
  TITLE_TEXT_MEDIA,
  TEXT_MEDIA,
  FLASHCARD,
  MULTIPLE_CHOICE_QUESTION,
  SINGLE_CHOICE_QUESTION,
  ORDER_THE_SEQUENCE,
  OPEN_QUESTION,
  SURVEY,
  QUESTION_ANSWER,
  FILL_THE_GAPS,
  PUBLISHED,
} from '@data/constants';
import Button from '@components/Button';
import Activities from '@api/Activities';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';

export default {
  name: 'CardContainer',
  props: {
    disableEdition: { type: Boolean, default: false },
  },
  components: {
    'ni-button': Button,
    draggable,
  },
  data () {
    return {
      draggableCards: [],
    };
  },
  computed: {
    ...mapState('program', ['card', 'activity']),
    ...mapGetters({ cards: 'program/getCards' }),
    isActivityPublished () {
      return this.activity.status === PUBLISHED;
    },
    isDraggableDisabled () {
      return this.$q.platform.is.mobile || this.disableEdition || this.isActivityPublished;
    },
  },
  watch: {
    cards: {
      handler () {
        this.draggableCards = cloneDeep(this.cards);
      },
      immediate: true,
    },
  },
  methods: {
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
      const questionTemplate = [
        MULTIPLE_CHOICE_QUESTION,
        SINGLE_CHOICE_QUESTION,
        ORDER_THE_SEQUENCE,
        OPEN_QUESTION,
        SURVEY,
        QUESTION_ANSWER,
      ];

      if ([TRANSITION, TITLE_TEXT_MEDIA, TITLE_TEXT].includes(card.template)) return card.title || '';
      if ([FLASHCARD, TEXT_MEDIA].includes(card.template)) return card.text || '';
      if (questionTemplate.includes(card.template)) return card.question || '';
      if (card.template === FILL_THE_GAPS) return card.gappedText || '';
      return '';
    },
    getTemplateName (value) {
      const template = CARD_TEMPLATES.find(t => t.value === value);
      return template ? template.label : '';
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
    async dropCard () {
      try {
        const cards = this.draggableCards.map(c => c._id);
        await Activities.updateById(this.activity._id, { cards });
        NotifyPositive('Modification enregistrée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification des cartes.');
      } finally {
        await this.$emit('refresh');
      }
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
      background-color: $grey-100
  &-locked-selected
    justify-content: flex-end
    .card-cell
      background-color: $grey-800
      color: $white
  .dot
    margin: 0 0 0 3px

.card-actions
  display: flex
  flex-direction: column
.locked-unselected
  color: $grey-400

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

.ghost
  opacity: 0.5
</style>
