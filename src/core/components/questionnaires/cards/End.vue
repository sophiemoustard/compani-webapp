<template>
  <div class="container">
    <ni-button class="on-left elm-width" icon="arrow_back" color="primary" @click="updateCardIndex(DECREMENT)" />
    <ni-button class="bg-primary btn" label="Valider" color="white" @click="submit" />
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
.container
  display: flex
  flex-direction: row
  align-items: center

.elm-width
  width: 10vw
.btn
  position: sticky
  top: 90vh
  left: 10vw
  width: 80vw

</style>
