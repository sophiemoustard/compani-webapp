<template>
  <div class="btn-container elm-width">
    <ni-button v-if="displayBack" icon="arrow_back" class="btn-back" color="primary" @click="goBack" />
    <ni-button class="bg-primary elm-width" :label="label" color="white" :loading="loading" @click="submit" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import Button from '@components/Button';
import { DECREMENT } from '@data/constants';

export default {
  name: 'FooterCard',
  components: {
    'ni-button': Button,
  },
  props: {
    displayBack: { type: Boolean, default: true },
    label: { type: String, default: '' },
    loading: { type: Boolean, default: false },
  },
  emits: ['submit'],
  setup (_, { emit }) {
    const $store = useStore();
    const goBack = () => $store.dispatch('questionnaire/updateCardIndex', { type: DECREMENT });

    const submit = () => emit('submit');

    return {
      // Methods
      goBack,
      submit,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
