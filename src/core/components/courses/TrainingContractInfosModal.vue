<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      <span class="text-weight-bold">Informations de la convention</span>
    </template>
     <div><span class="text-weight-bold">Structure :</span> {{ course.companies[0].name }}</div>
     <div><span class="text-weight-bold">Nom du programme :</span> {{ course.subProgram.program.name }}</div>
     <div class="learning-goals">
      <div class="text-weight-bold">Objectifs :</div>
      {{ course.subProgram.program.learningGoals }}
    </div>
     <div>
      <span class="text-weight-bold">Créneaux :</span>
      {{ formatQuantity('créneau', course.slots.length + course.slotsToPlan.length, 'x') }}
    </div>
    <div><span class="text-weight-bold">Durée :</span> {{ totalDuration }}</div>
    <div>
      <span class="text-weight-bold">Effectif :</span>
      {{ course.misc }} jusqu'à {{ course.maxTrainees }} stagiaires
    </div>
    <div><span class="text-weight-bold">Dates :</span> {{ dates }}</div>
    <div><span class="text-weight-bold">Lieux :</span> {{ addressList }}</div>
    <div>
      <span class="text-weight-bold">Intervenant(e) :</span>
      {{ formatIdentity(course.trainer.identity, 'FL') }}
    </div>
    <div class="q-mb-md"><span class="text-weight-bold">Prix :</span> {{ price }} €</div>
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Générer la convention" icon-right="add" color="white"
        @click="submit" :loading="loading" />
    </template>
  </ni-modal>
</template>

<script>
import { computed, toRefs } from 'vue';
import get from 'lodash/get';
import compact from 'lodash/compact';
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import { formatIdentity, formatQuantity } from '@helpers/utils';
import CompaniDuration from '@helpers/dates/companiDurations';
import CompaniDate from '@helpers/dates/companiDates';
import { getISOTotalDuration, ascendingSortBy } from '@helpers/dates/utils';
import { SHORT_DURATION_H_MM, E_LEARNING, DD_MM_YYYY, REMOTE } from '@data/constants';

export default {
  name: 'TrainingContractInfosModal',
  props: {
    modelValue: { type: Boolean, default: false },
    course: { type: Object, default: () => ({}) },
    price: { type: Number, default: () => 0 },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit'],
  setup (props, { emit }) {
    const { course } = toRefs(props);

    // make sure code is similar to back part in TrainingContracts helper
    const liveDuration = computed(() => {
      if (course.value.slotsToPlan.length) {
        const theoreticalDurationList = course.value.subProgram.steps
          .filter(step => step.type !== E_LEARNING)
          .map(step => step.theoreticalDuration);

        if (theoreticalDurationList.some(duration => !duration)) return '';

        return theoreticalDurationList
          .reduce((acc, duration) => acc.add(duration), CompaniDuration())
          .format(SHORT_DURATION_H_MM);
      }

      return CompaniDuration(getISOTotalDuration(course.value.slots)).format(SHORT_DURATION_H_MM);
    });

    const elearnigDuration = computed(() => {
      if (!course.value.subProgram.steps.some(step => step.type === E_LEARNING)) return '';

      return course.value.subProgram.steps
        .filter(step => step.type === E_LEARNING)
        .reduce((acc, step) => acc.add(step.theoreticalDuration), CompaniDuration())
        .format(SHORT_DURATION_H_MM);
    });

    const totalDuration = computed(() => {
      const elearningDuration = elearnigDuration.value
        ? ` (+ ${elearnigDuration.value} de e-learning)`
        : '';
      return liveDuration.value + elearningDuration;
    });

    const dates = computed(() => {
      const slotDatesWithDuplicate = [...course.value.slots]
        .sort(ascendingSortBy('startDate'))
        .map(slot => CompaniDate(slot.startDate).format(DD_MM_YYYY));
      const uniqDates = [...new Set(slotDatesWithDuplicate)];

      return uniqDates.join(' - ');
    });

    const addressList = computed(() => {
      if (course.value.subProgram.steps.every(step => step.type === REMOTE)) return 'en distanciel';
      const fullAddressList = compact(course.value.slots.map(slot => get(slot, 'address.fullAddress')));
      if ([...new Set(fullAddressList)].length <= 2) return [...new Set(fullAddressList)].join(', ');

      const cityList = compact(course.value.slots.map(slot => get(slot, 'address.city')));
      return [...new Set(cityList)].join(', ');
    });

    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');

    return {
      // Computed
      totalDuration,
      dates,
      addressList,
      // Methods
      hide,
      input,
      submit,
      formatIdentity,
      formatQuantity,
    };
  },
};
</script>

<style lang="sass" scoped>
.learning-goals
  white-space: pre-wrap
</style>
