<template>
  <div class="card-container">
    <q-card class="elm-width card" flat>
      <span class="title">{{ card.title }}</span>
    </q-card>
    <ni-footer label="Suivant" @submit="updateCardIndex" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { INCREMENT } from '@data/constants';
import Footer from '@components/questionnaires/cards/Footer';

export default {
  name: 'Transition',
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

<style lang="sass" scoped>
.title
  color: $copper-grey-700
  font-weight: bold
</style>
