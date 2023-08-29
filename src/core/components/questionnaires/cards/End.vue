<template>
  <ni-footer label="Valider" @submit="submit" :loading="loading" />
</template>

<script>
import Footer from '@components/questionnaires/cards/Footer';

export default {
  name: 'End',
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
      // Methods
      submit,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
