<template>
  <div class="card-container">
    <div class="elm-width container">
      <span v-if="card.title" class="title q-mb-sm">{{ card.title }}</span>
      <span class="q-mb-sm">{{ card.text }}</span>
      <img v-if="card.media" :src="card.media.link" class="img q-mb-sm">
    </div>
    <ni-footer label="Suivant" @submit="updateCardIndex(INCREMENT)" />
  </div>
</template>

<script>

import { INCREMENT } from '@data/constants';
import Footer from '@components/questionnaires/cards/Footer';

export default {
  name: 'TitleTextMedia',
  components: {
    'ni-footer': Footer,

  },
  emits: ['submit'],
  props: {
    card: { type: Object, required: true },
  },
  setup (_, { emit }) {
    const updateCardIndex = type => emit('submit', type);

    return {
      // Data
      INCREMENT,
      // Methods
      updateCardIndex,
    };
  },
};
</script>

<style lang="sass" scoped>

.container
  display: flex
  flex-direction: column
  flex: 1
  align-items: center
  margin: 0 0 20px 0
.title
  color: $copper-grey-700
  font-weight: bold
  text-align: center
.img
  width: 30vw
  @media screen and (max-width: $breakpoint-md)
    width: 50vw
  height: auto
</style>
