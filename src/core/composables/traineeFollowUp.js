import { useStore } from 'vuex';
import { ref, computed } from 'vue';
import Courses from '@api/Courses';
import { NotifyNegative } from '@components/popup/notify';
import { useCourses } from '@composables/courses';
import { formatIdentity } from '@helpers/utils';

export const useTraineeFollowUp = (profileId) => {
  const $store = useStore();
  const learners = ref([]);
  const learnersLoading = ref(false);

  const company = computed(() => $store.getters['main/getCompany']);

  const { isClientInterface } = useCourses();

  const formatRow = (trainee) => {
    const formattedName = formatIdentity(trainee.identity, 'FL');

    return {
      _id: trainee._id,
      identity: { ...trainee.identity, fullName: formattedName },
      progress: trainee.progress,
      steps: trainee.steps,
      firstMobileConnection: trainee.firstMobileConnection,
    };
  };

  const getLearnersList = async () => {
    try {
      learnersLoading.value = true;
      const course = await Courses.getFollowUp(
        profileId.value,
        isClientInterface ? { company: company.value._id } : null
      );

      if (course) learners.value = Object.freeze(course.trainees.map(formatRow));
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la récupération des apprenants');
      learners.value = [];
    } finally {
      learnersLoading.value = false;
    }
  };

  return {
    // Data
    learners,
    learnersLoading,
    // Methods
    getLearnersList,
  };
};
