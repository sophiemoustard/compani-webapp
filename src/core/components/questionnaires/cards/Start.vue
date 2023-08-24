<template>
  <div class="card-container">
    <ni-select caption="Qui êtes-vous ?" :model-value="trainee._id" :options="traineesOptions"
      @update:model-value="updateTrainee" required-field class="elm-width" />
    <ni-footer label="Suivant" @submit="updateCardIndex(INCREMENT)" :display-back="false" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { toRefs, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { formatAndSortUserOptions } from '@helpers/utils';
import Select from '@components/form/Select';
import Footer from '@components/questionnaires/cards/Footer';
import { NotifyWarning } from '@components/popup/notify';
import { INCREMENT } from '@data/constants';

export default {
  name: 'Start',
  components: {
    'ni-select': Select,
    'ni-footer': Footer,
  },
  props: {
    course: { type: Object, required: true },
    trainee: { type: Object, required: true },
  },
  emits: ['update-trainee', 'submit'],
  setup (props, { emit }) {
    const { course, trainee } = toRefs(props);

    const rules = computed(() => ({ trainee: { _id: { required } } }));
    const v$ = useVuelidate(rules, { trainee });

    const traineesOptions = computed(() => (get(course.value, 'trainees')
      ? formatAndSortUserOptions(course.value.trainees, false)
      : []));

    const updateTrainee = event => emit('update-trainee', event);

    const updateCardIndex = (type) => {
      v$.value.trainee.$touch();
      if (v$.value.trainee.$error) return NotifyWarning('Champ(s) invalide(s).');

      emit('submit', type);
    };

    return {
      // Data
      INCREMENT,
      // Methods
      updateTrainee,
      updateCardIndex,
      // Computed
      traineesOptions,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
