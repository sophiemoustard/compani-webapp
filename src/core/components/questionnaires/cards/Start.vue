<template>
  <div class="card-container">
    <ni-select caption="Qui êtes-vous ?" :model-value="trainee" :options="traineesOptions"
      @update:model-value="updateTrainee" required-field class="elm-width"
      :error="v$.trainee.$error" @blur="v$.trainee.$touch" />
    <ni-footer label="Suivant" @submit="updateCardIndex" :display-back="false" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { toRefs, computed } from 'vue';
import { useStore } from 'vuex';
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
    trainee: { type: String, required: true },
  },
  emits: ['update-trainee'],
  setup (props, { emit }) {
    const $store = useStore();
    const { course, trainee } = toRefs(props);

    const rules = computed(() => ({ trainee: { required } }));
    const v$ = useVuelidate(rules, { trainee });

    const traineesOptions = computed(() => (get(course.value, 'trainees')
      ? formatAndSortUserOptions(course.value.trainees, false)
      : []));

    const updateTrainee = event => emit('update-trainee', event);

    const updateCardIndex = () => {
      v$.value.trainee.$touch();
      if (v$.value.trainee.$error) return NotifyWarning('Champ(s) invalide(s).');

      $store.dispatch('questionnaire/updateCardIndex', { type: INCREMENT });
    };

    return {
      // Methods
      updateTrainee,
      updateCardIndex,
      // Computed
      traineesOptions,
      // Validations
      v$,
    };
  },
};
</script>

<style lang="sass" scoped>
</style>
