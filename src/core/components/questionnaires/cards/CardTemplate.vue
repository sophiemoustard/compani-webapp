<template>
  <component :is="templateInstance" :key="card._id" :card="card" />
</template>

<script>
import { computed, toRefs, defineAsyncComponent } from 'vue';
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
  setup (props) {
    const { card } = toRefs(props);

    const templateInstance = computed(() => {
      switch (card.value.template) {
        case TRANSITION:
          return defineAsyncComponent(() => import('src/core/components/questionnaires/cards/Transition'));
        default:
          return null;
      }
    });

    return {
      // Computed
      templateInstance,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
