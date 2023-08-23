<template>
  <div class="card-container">
    <ni-button class="back-btn" icon="arrow_back" color="primary" @click="updateCardIndex(DECREMENT)" />
    <ni-button class="bg-primary btn" label="Valider" color="white" :loading="loading" @click="submit" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { toRefs, computed } from 'vue';
import { formatAndSortUserOptions } from '@helpers/utils';
import Button from '@components/Button';
import { DECREMENT } from '@data/constants';

export default {
  name: 'Start',
  components: {
    'ni-button': Button,
  },
  props: {
    course: { type: Object, required: true },
    trainee: { type: Object, required: true },
    loading: { type: Boolean, required: true },
  },
  emits: ['update-trainee', 'click', 'submit'],
  setup (props, { emit }) {
    const { course } = toRefs(props);
    const traineesOptions = computed(() => (get(course.value, 'trainees')
      ? formatAndSortUserOptions(course.value.trainees, false)
      : []));

    const updateCardIndex = type => emit('click', type);

    const submit = () => emit('submit');

    return {
      // DATA
      DECREMENT,
      // Methods
      updateCardIndex,
      submit,
      // Computed
      traineesOptions,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
