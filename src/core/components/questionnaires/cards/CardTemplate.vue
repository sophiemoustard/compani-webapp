<template>
  <div v-if="card.template === TRANSITION">
    <card-transition :title="card.title" @submit="submit" />
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
  emits: ['submit'],
  setup (_, { emit }) {
    const submit = type => emit('submit', type);

    return {
      // Data
      TRANSITION,
      // Methods
      submit,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
