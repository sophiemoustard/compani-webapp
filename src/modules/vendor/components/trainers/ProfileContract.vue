<template>
  <div>
    <div class="clickable-name text-italic q-mb-md">
      <router-link :to="gotToCourseDirectory()">Voir les formations du formateur</router-link>
    </div>
    <ni-trainer-mission-table :trainer-missions="trainerMissions" :loading="missionCreationLoading" />
    <q-btn class="fixed fab-custom" no-caps rounded icon="add" label="Créer un ordre de mission" color="primary"
      @click="openTrainerMissionCreationModal" :loading="missionCreationLoading" :disable="!courseList.length" />

    <ni-trainer-mission-creation-modal v-model="missionCreationModal" v-model:trainer-mission="newTrainerMission"
      @submit="createTrainerMission" :validations="v$.newTrainerMission" @hide="resetMissionCreationModal"
      :loading="missionCreationLoading" :courses="coursesWithoutTrainerMission" />
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
import TrainerMissionCreationModal from '@components/courses/TrainerMissionCreationModal';
import TrainerMissionTable from '@components/courses/TrainerMissionTable';

export default {
  name: 'ProfileContract',
  components: {
    'ni-trainer-mission-creation-modal': TrainerMissionCreationModal,
    'ni-trainer-mission-table': TrainerMissionTable,
  },
  setup () {
    const $store = useStore();

    const missionCreationModal = ref(false);
    const missionCreationLoading = ref(false);
    const newTrainerMission = ref({ courses: [], fee: 0, program: '', file: '' });
    const courseList = ref([]);
    const trainerMissions = ref([]);

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

    const coursesWithoutTrainerMission = computed(() => {
      const trainerMissionsCourses = trainerMissions.value.map(tm => tm.courses.map(c => c._id)).flat();

      return courseList.value.filter(c => !trainerMissionsCourses.includes(c._id));
    });

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

    const refreshTrainerMissions = async () => {
      try {
        const missions = await TrainerMissions.list({ trainer: trainer.value._id });
        trainerMissions.value = missions;
      } catch (e) {
        console.error(e);
        trainerMissions.value = [];
        NotifyNegative('Erreur lors de la récupération des ordres de mission.');
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
        await refreshTrainerMissions();
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de l\'ordre de mission.');
      } finally {
        missionCreationLoading.value = false;
      }
    };

    const openTrainerMissionCreationModal = () => {
      if (!coursesWithoutTrainerMission.value.length) {
        return NotifyWarning('Toutes les formations sont rattachées à un ordre de mission.');
      }

      missionCreationModal.value = true;
    };

    const resetMissionCreationModal = () => {
      newTrainerMission.value = { program: '', courses: [], fee: 0, file: '' };
      v$.value.newTrainerMission.$reset();
    };

    const gotToCourseDirectory = () => {
      $store.dispatch('course/setSelectedTrainer', { trainerId: trainer.value._id });

      return { name: 'ni management blended courses' };
    };

    const created = async () => {
      await Promise.all([refreshCourses(), refreshTrainerMissions()]);
    };

    created();

    return {
      // Validation
      v$,
      // Data
      missionCreationModal,
      missionCreationLoading,
      newTrainerMission,
      trainerMissions,
      courseList,
      // Computed
      coursesWithoutTrainerMission,
      // Methods
      openTrainerMissionCreationModal,
      createTrainerMission,
      resetMissionCreationModal,
      gotToCourseDirectory,
    };
  },
};
</script>