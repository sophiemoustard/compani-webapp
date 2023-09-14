<template>
  <component :is="templateInstance" :key="card._id" :card="card" />
</template>

<script>
import { computed, toRefs, defineAsyncComponent } from 'vue';
import { TRANSITION, TITLE_TEXT_MEDIA, TITLE_TEXT, TEXT_MEDIA, OPEN_QUESTION } from '@data/constants';

export default {
  name: 'CardTemplate',
  components: {
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
        case TITLE_TEXT_MEDIA:
        case TITLE_TEXT:
        case TEXT_MEDIA:
          return defineAsyncComponent(() => import('src/core/components/questionnaires/cards/TitleTextMedia'));
        case OPEN_QUESTION:
          return defineAsyncComponent(() => import('src/core/components/questionnaires/cards/OpenQuestion'));
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
