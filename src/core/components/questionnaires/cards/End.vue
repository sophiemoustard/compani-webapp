<template>
  <div class="btn">
    <ni-button class="on-left" icon="arrow_back" color="primary" @click="updateCardIndex(DECREMENT)" />
    <ni-button class="bg-primary elm-width" label="Suivant" color="white" />
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
  },
  emits: ['update-trainee', 'click'],
  setup (props, { emit }) {
    const { course } = toRefs(props);
    const traineesOptions = computed(() => (get(course.value, 'trainees')
      ? formatAndSortUserOptions(course.value.trainees, false)
      : []));

    const updateCardIndex = type => emit('click', type);

    return {
      // DATA
      DECREMENT,
      // Methods
      updateCardIndex,
      // Computed
      traineesOptions,
    };
  },
};
</script>

<style lang="sass" scoped>
.container
  display: flex
  flex: 1
  flex-direction: column
  align-items: center
  justify-content: space-between

.elm-width
  width: 80vw
  @media screen and (min-width: $breakpoint-sm-max)
      width: 60vw
</style>
