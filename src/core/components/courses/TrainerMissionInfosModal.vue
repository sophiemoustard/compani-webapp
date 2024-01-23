<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      <span class="text-weight-bold">Informations de l'ordre de mission</span>
    </template>
    <div>
      <span class="text-weight-bold">Prénom et NOM :</span> {{ formatIdentity(course.trainer.identity, 'FL') }}
    </div>
    <div>
      <span class="text-weight-bold">Fonction : </span>
      <span v-if="course.trainer.identity.title">{{ trainerGender }}</span>
      <span v-else class="text-orange-700">Civilité manquante</span>
    </div>
    <div><span class="text-weight-bold">Nom du programme :</span> {{ courses[0].subProgram.program.name }}</div>
    <div>
      <span class="text-weight-bold">Durée :</span> {{ formatQuantity('session', slotsCount) }} - {{ liveDuration }}
    </div>
    <div><span class="text-weight-bold">Nombre de groupes :</span> {{ courses.length }}</div>
    <div><span class="text-weight-bold">Structure(s) :</span> {{ companies }}</div>
    <div><span class="text-weight-bold">Lieux :</span> {{ addressList }}</div>
    <div><span class="text-weight-bold">Dates :</span> {{ dates }}</div>
    <div><span class="text-weight-bold">Formation certifiante :</span> {{ formattedCertifications }}</div>
    <div class="q-mb-md"><span class="text-weight-bold">Frais de formateur :</span> {{ fee }} €</div>
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
import { NotifyWarning } from '@components/popup/notify';
import { formatIdentity, formatQuantity, formatName } from '@helpers/utils';
import { composeCourseName } from '@helpers/courses';
import CompaniDuration from '@helpers/dates/companiDurations';
import CompaniDate from '@helpers/dates/companiDates';
import { getISOTotalDuration, ascendingSortBy } from '@helpers/dates/utils';
import { SHORT_DURATION_H_MM, E_LEARNING, DD_MM_YYYY, REMOTE, CIVILITY_OPTIONS } from '@data/constants';
import { MR } from '../../data/constants';

export default {
  name: 'TrainerMissionInfosModal',
  props: {
    modelValue: { type: Boolean, default: false },
    courses: { type: Array, default: () => [] },
    fee: { type: Number, default: 0 },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit'],
  setup (props, { emit }) {
    const { courses } = toRefs(props);

    const course = computed(() => courses.value[0]);

    const trainerGender = computed(() => {
      const civility = get(CIVILITY_OPTIONS.find(opt => course.value.trainer.identity.title === opt.value), 'label');
      return civility === MR ? 'Formateur' : 'Formatrice';
    });

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

    const slotsCount = computed(() => course.value.slots.length + course.value.slotsToPlan.length);

    const companies = computed(() => [...new Set(courses.value.map(c => formatName(c.companies)))].join(', '));

    const slots = computed(() => courses.value.map(c => c.slots).flat());

    const dates = computed(() => {
      const slotDatesWithDuplicate = [...slots.value]
        .sort(ascendingSortBy('startDate'))
        .map(slot => CompaniDate(slot.startDate).format(DD_MM_YYYY));
      const uniqDates = [...new Set(slotDatesWithDuplicate)];

      return uniqDates.join(' - ');
    });

    const addressList = computed(() => {
      const { steps } = course.value.subProgram;

      if (steps.every(step => step.type === REMOTE)) return 'en distanciel';
      const fullAddressList = compact(slots.value.map(slot => get(slot, 'address.fullAddress')));
      if ([...new Set(fullAddressList)].length <= 2) return [...new Set(fullAddressList)].join(', ');

      const cityList = compact(slots.value.map(slot => get(slot, 'address.city')));
      return [...new Set(cityList)].join(', ');
    });

    const formattedCertifications = computed(() => {
      const courseNames = courses.value
        .filter(c => c.hasCertifyingTest)
        .map(c => composeCourseName(c, true)).join(', ');
      return courseNames ? `au moins un(e) stagiaire de ${courseNames}` : 'Non';
    });

    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => {
      if (!course.value.trainer.identity.title) {
        NotifyWarning('Civilité manquante, veuillez l\'ajouter dans l\'onglet "Infos personnelles"');
      } else emit('submit');
    };

    return {
      // Data
      CIVILITY_OPTIONS,
      // Computed
      slotsCount,
      liveDuration,
      companies,
      dates,
      addressList,
      formattedCertifications,
      course,
      trainerGender,
      // Methods
      hide,
      input,
      submit,
      formatIdentity,
      formatQuantity,
      get,
    };
  },
};
</script>

<style lang="sass" scoped>
.learning-goals
  white-space: pre-wrap
</style>
