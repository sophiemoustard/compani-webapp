<template>
    <ni-footer label="Valider" @submit="submit" :loading="loading" />
</template>

<script>
import Footer from '@components/questionnaires/cards/Footer';
import { DECREMENT } from '@data/constants';

export default {
  name: 'Start',
  components: {
    'ni-footer': Footer,
  },
  props: {
    loading: { type: Boolean, required: true },
  },
  emits: ['submit'],
  setup (_, { emit }) {
    const submit = () => emit('submit');

    return {
      // DATA
      DECREMENT,
      // Methods
      submit,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
