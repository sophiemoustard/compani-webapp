<template>
  <div class="card-container">
    <ni-select caption="Qui êtes-vous ?" class="elm-width" :model-value="trainee" :options="traineesOptions"
      :error="validations.trainee.$error" @blur="validations.trainee.$touch" @update:model-value="updateTrainee"
      required-field />
    <ni-footer label="Suivant" @submit="updateCardIndex" :display-back="false" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { toRefs, computed } from 'vue';
import { useStore } from 'vuex';
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
    trainee: { type: String, required: true },
    validations: { type: Object, required: true },
  },
  emits: ['update-trainee'],
  setup (props, { emit }) {
    const $store = useStore();
    const { course, validations } = toRefs(props);

    const traineesOptions = computed(() => (get(course.value, 'trainees.length')
      ? formatAndSortUserOptions(course.value.trainees, false)
      : []));

    const updateTrainee = event => emit('update-trainee', event);

    const updateCardIndex = () => {
      validations.value.trainee.$touch();
      if (validations.value.trainee.$error) return NotifyWarning('Champ(s) invalide(s).');

      $store.dispatch('questionnaire/updateCardIndex', { type: INCREMENT });
    };

    return {
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
.select
  width: 100%
</style>
