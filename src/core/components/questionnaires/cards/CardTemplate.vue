<template>
  <div v-if="card.template === TRANSITION">
    <card-transition :title="card.title" />
  </div>
  <div v-if="[TITLE_TEXT_MEDIA, TITLE_TEXT, TEXT_MEDIA].includes(card.template)">
      <card-title-text-media :card="card" />
  </div>
  <div v-if="card.template === OPEN_QUESTION">
    <card-open-question @submit="submit" />
  </div>
</template>

<script>
import { TRANSITION, TITLE_TEXT_MEDIA, TITLE_TEXT, TEXT_MEDIA, OPEN_QUESTION } from '@data/constants';
import Transition from '@components/questionnaires/cards/Transition';
import TitleTextMedia from '@components/questionnaires/cards/TitleTextMedia';
import OpenQuestion from '@components/questionnaires/cards/OpenQuestion';

export default {
  name: 'CardTemplate',
  components: {
    'card-transition': Transition,
    'card-title-text-media': TitleTextMedia,
    'card-open-question': OpenQuestion,
  },
  props: {
    card: { type: Object, required: true },
  },
  setup () {
    return {
      // Data
      TRANSITION,
      TITLE_TEXT_MEDIA,
      TITLE_TEXT,
      TEXT_MEDIA,
      OPEN_QUESTION,
      // Methods
      submit,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
