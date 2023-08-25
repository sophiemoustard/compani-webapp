<template>
  <div v-if="card.template === TRANSITION">
    <card-transition :title="card.title" />
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
  setup () {
    return {
      // Data
      TRANSITION,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
