<template>
  <div>
    <q-btn class="fixed fab-custom" no-caps rounded icon="add" label="Créer un ordre de mission" color="primary"
      @click="missionCreationModal = true" :loading="missionCreationLoading" :disable="!courseList.length" />

    <ni-trainer-mission-creation-modal v-model="missionCreationModal" v-model:trainer-mission="newTrainerMission"
      @submit="createTrainerMission" :validations="v$.newTrainerMission" @hide="resetMissionCreationModal"
      :loading="missionCreationLoading" :courses="courseList" />
  </div>
</template>

<script>
import { useStore } from 'vuex';
import { computed, ref } from 'vue';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import { strictPositiveNumber } from '@helpers/vuelidateCustomVal';
import Courses from '@api/Courses';
import TrainerMissions from '@api/TrainerMissions';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { TRAINER, BLENDED, OPERATIONS } from '@data/constants';
import TrainerMissionCreationModal from '../../../../core/components/courses/TrainerMissionCreationModal';

export default {
  name: 'ProfileContract',
  components: {
    'ni-trainer-mission-creation-modal': TrainerMissionCreationModal,
  },
  setup () {
    const $store = useStore();

    const missionCreationModal = ref(false);
    const missionCreationLoading = ref(false);
    const newTrainerMission = ref({ courses: [], fee: 0, program: '', file: '' });
    const courseList = ref([]);

    const rules = computed(() => ({
      newTrainerMission: {
        program: { required },
        file: { required },
        fee: { required, strictPositiveNumber },
        courses: { required },
      },
    }));

    const v$ = useVuelidate(rules, { newTrainerMission });

    const trainer = computed(() => (TRAINER === get($store.state.main.loggedUser, 'role.vendor.name')
      ? $store.state.main.loggedUser
      : $store.state.userProfile.userProfile));

    const refreshCourses = async () => {
      try {
        const courses = await await Courses.list({
          trainer: trainer.value._id,
          format: BLENDED,
          action: OPERATIONS,
          isArchived: false,
        });
        courseList.value = courses;
      } catch (e) {
        console.error(e);
        courseList.value = [];
        NotifyNegative('Erreur lors de la récupération des formations.');
      }
    };

    const formatPayload = () => {
      const { courses, file, fee } = newTrainerMission.value;
      const form = new FormData();
      courses.forEach(course => form.append('courses', course));
      form.append('file', file);
      form.append('trainer', trainer.value._id);
      form.append('fee', fee);

      return form;
    };

    const createTrainerMission = async () => {
      try {
        v$.value.newTrainerMission.$touch();
        if (v$.value.newTrainerMission.$error) return NotifyWarning('Champ(s) invalide(s)');
        missionCreationLoading.value = true;

        await TrainerMissions.create(formatPayload());

        missionCreationModal.value = false;
        NotifyPositive('Ordre de mission ajouté.');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de l\'ordre de mission.');
      } finally {
        missionCreationLoading.value = false;
      }
    };

    const resetMissionCreationModal = () => {
      newTrainerMission.value = { program: '', courses: [], fee: 0, file: '' };
      v$.value.newTrainerMission.$reset();
    };

    const created = async () => {
      await Promise.all([refreshCourses()]);
    };

    created();

    return {
      // Validation
      v$,
      // Data
      missionCreationModal,
      missionCreationLoading,
      newTrainerMission,
      // Computed
      courseList,
      // Methods
      createTrainerMission,
      resetMissionCreationModal,
    };
  },
};
</script>
