<template>
  <div class="container">
    <ni-select caption="Qui êtes-vous ?" :model-value="trainee._id" :options="traineesOptions"
      @update:model-value="update" required-field class="elm-width" />
    <ni-button class="bg-primary btn" label="Suivant" color="white" @click="goToNextCard(INCREMENT)" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { toRefs, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { formatAndSortUserOptions } from '@helpers/utils';
import Select from '@components/form/Select';
import Button from '@components/Button';
import { NotifyWarning } from '@components/popup/notify';
import { INCREMENT } from '@data/constants';

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
  emits: ['update-trainee', 'click'],
  setup (props, { emit }) {
    const { course, trainee } = toRefs(props);

    const rules = computed(() => ({ trainee: { _id: { required } } }));
    const v$ = useVuelidate(rules, { trainee });

    const traineesOptions = computed(() => (get(course.value, 'trainees')
      ? formatAndSortUserOptions(course.value.trainees, false)
      : []));

    const update = event => emit('update-trainee', event);

    const goToNextCard = (type) => {
      v$.value.trainee.$touch();
      if (v$.value.trainee.$error) return NotifyWarning('Champ(s) invalide(s).');

      emit('click', type);
    };

    return {
      // Data
      INCREMENT,
      // Methods
      update,
      goToNextCard,
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

.elm-width
  width: 40vw
  @media screen and (max-width: $breakpoint-md)
    left: 10vw
    width: 80vw
.btn
  position: absolute
  top: 90vh
  left: 30vw
  width: 40vw
  @media screen and (max-width: $breakpoint-md)
    left: 10vw
    width: 80vw
</style>
