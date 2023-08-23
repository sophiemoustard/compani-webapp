<template>
  <q-card class="card" flat>
    <span class="title">{{ title }}</span>
  </q-card>
  <div>
    <ni-button class="back-btn" icon="arrow_back" color="primary" @click="updateCardIndex(DECREMENT)" />
    <ni-button class="bg-primary btn" label="Suivant" color="white" @click="updateCardIndex(INCREMENT)" />
  </div>
</template>

<script>

import { INCREMENT, DECREMENT } from '@data/constants';
import Button from '@components/Button';

export default {
  name: 'Transition',
  components: {
    'ni-button': Button,

  },
  emits: ['click'],
  props: {
    title: { type: String, required: true },
  },
  setup (_, { emit }) {
    const updateCardIndex = type => emit('click', type);

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
