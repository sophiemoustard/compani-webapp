<template>
  <div class="card-container">
    <span>SONDAGE</span>
    <ni-footer label="Suivant" @submit="updateCardIndex" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { INCREMENT } from '@data/constants';
import Footer from '@components/questionnaires/cards/Footer';

export default {
  name: 'Survey',
  components: {
    'ni-footer': Footer,
  },
  props: {
    card: { type: Object, required: true },
  },
  setup () {
    const $store = useStore();
    const updateCardIndex = () => $store.dispatch('questionnaire/updateCardIndex', { type: INCREMENT });

    return {
      // Methods
      updateCardIndex,
    };
  },
};
</script>
