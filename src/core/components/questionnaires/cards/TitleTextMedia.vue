<template>
  {{ card }}
  <ni-footer label="Suivant" @submit="updateCardIndex(INCREMENT)" />
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
.title
  color: $copper-grey-700
  font-weight: bold
</style>
