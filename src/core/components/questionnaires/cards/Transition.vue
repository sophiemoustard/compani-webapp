<template>
  <q-card class="elm-width card" flat>
    <span class="title">{{ title }}</span>
  </q-card>
  <ni-footer label="Suivant" @submit="updateCardIndex(INCREMENT)" />
</template>

<script>

import { INCREMENT, DECREMENT } from '@data/constants';
import Footer from '@components/questionnaires/cards/Footer';

export default {
  name: 'Transition',
  components: {
    'ni-footer': Footer,

  },
  emits: ['submit'],
  props: {
    title: { type: String, required: true },
  },
  setup (_, { emit }) {
    const updateCardIndex = type => emit('submit', type);

    return {
      // Data
      INCREMENT,
      DECREMENT,
      // Methods
      updateCardIndex,
    };
  },
};
</script>

<style lang="sass" scoped>
.title
  color: $copper-grey-700
  font-weight: bold
</style>
