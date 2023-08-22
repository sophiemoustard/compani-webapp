<template>
  <div class="container">
    <ni-select caption="Qui êtes-vous ?" :model-value="trainee._id" :options="traineesOptions"
      @update:model-value="update" required-field class="elm-width" />
    <ni-button class="bg-primary elm-width" label="Suivant" color="white" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { toRefs, computed } from 'vue';
import { formatAndSortUserOptions } from '@helpers/utils';
import Select from '@components/form/Select';
import Button from '@components/Button';

export default {
  name: 'Start',
  components: {
    'ni-select': Select,
    'ni-button': Button,
  },
  props: {
    course: { type: Object, required: true },
    trainee: { type: Object, required: true },
  },
  emits: ['update-trainee', 'submit'],
  setup (props, { emit }) {
    const { course } = toRefs(props);
    const traineesOptions = computed(() => (get(course.value, 'trainees')
      ? formatAndSortUserOptions(course.value.trainees, false)
      : []));

    const update = event => emit('update-trainee', event);

    return {
      // Methods
      update,
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
  width: 80%
  @media screen and (min-width: $breakpoint-sm-max)
      width: 60%
</style>
