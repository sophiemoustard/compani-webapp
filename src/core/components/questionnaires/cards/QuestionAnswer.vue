<template>
  <div>Question reponses</div>
  <ni-footer label="Suivant" @submit="updateCardIndex" />
</template>

<script>
import { useStore } from 'vuex';
import { INCREMENT } from '../../../data/constants';
import Footer from './Footer';

export default {
  name: 'QuestionAnswer',
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
