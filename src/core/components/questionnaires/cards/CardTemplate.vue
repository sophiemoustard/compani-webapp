<template>
  <div class="card-container" v-if="card.template === TRANSITION">
    <card-transition :title="card.title" @click="click" />
  </div>
</template>

<script>
import { TRANSITION } from '@data/constants';
import Transition from '@components/questionnaires/cards/Transition';

export default {
  name: 'CardTemplate',
  components: {
    'card-transition': Transition,
  },
  props: {
    card: { type: Object, required: true },
  },
  emits: ['click'],
  setup (_, { emit }) {
    const click = type => emit('click', type);
    return {
      // Data
      TRANSITION,
      // Methods
      click,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
