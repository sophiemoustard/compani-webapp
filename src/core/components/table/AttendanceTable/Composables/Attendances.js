import { ref, computed } from 'vue';
import { useStore } from 'vuex';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Attendances from '@api/Attendances';
import Users from '@api/Users';
import {
  HH_MM,
  DAY_OF_WEEK_SHORT,
  DAY_OF_MONTH,
  MONTH_SHORT,
  COACH_ROLES,
  VENDOR_ADMIN,
  TRAINING_ORGANISATION_MANAGER,
} from '@data/constants';
import { upperCaseFirstLetter, formatIdentity, sortStrings, formatAndSortIdentityOptions } from '@helpers/utils';
import { minArrayLength } from '@helpers/vuelidateCustomVal';
import CompaniDate from '@helpers/dates/companiDates';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';

export const useAttendances = (course, isClientInterface, canUpdate, loggedUser, modalLoading) => {
  const $q = useQuasar();
  const $router = useRouter();
  const $store = useStore();

  const attendances = ref([]);
  const traineeAdditionModal = ref(false);
  const newTraineeAttendance = ref({ trainee: '', attendances: [] });
  const potentialTrainees = ref([]);
  const loading = ref(false);

  const attendanceRules = computed(() => ({
    newTraineeAttendance: { trainee: { required }, attendances: { minArrayLength: minArrayLength(1) } },
  }));

  const v$ = useVuelidate(attendanceRules, { newTraineeAttendance });

  const attendanceColumns = computed(() => {
    const columns = [{
      name: 'trainee',
      align: 'left',
      field: row => formatIdentity(row.identity, 'FL'),
      style: !$q.platform.is.mobile ? 'max-width: 250px' : 'max-width: 150px',
    }];
    if (!course.value.slots) return columns;

    return [
      ...columns,
      ...course.value.slots.map(s => ({
        name: `slot-${s._id}`,
        slot: s._id,
        field: '_id',
        align: 'center',
        style: 'width: 80px; min-width: 80px',
        month: upperCaseFirstLetter(CompaniDate(s.startDate).format(MONTH_SHORT)),
        day: CompaniDate(s.startDate).format(DAY_OF_MONTH),
        weekDay: upperCaseFirstLetter(CompaniDate(s.startDate).format(DAY_OF_WEEK_SHORT)),
        startHour: CompaniDate(s.startDate).format(HH_MM),
        endHour: CompaniDate(s.endDate).format(HH_MM),
      })),
    ];
  });

  const unsubscribedTrainees = computed(() => {
    const traineesId = course.value.trainees.map(trainee => trainee._id);

    const unsubscribedTraineesId = [...new Set(attendances.value
      .filter(a => (!traineesId.includes(a.trainee)))
      .map(a => a.trainee))];

    if (!unsubscribedTraineesId.length) return [];

    return unsubscribedTraineesId
      .reduce((acc, traineeId) => {
        const trainee = potentialTrainees.value.find(t => (t._id === traineeId));
        if (trainee) acc.push({ ...trainee, external: true });

        return acc;
      }, [])
      .sort((a, b) => sortStrings(a.identity.lastname, b.identity.lastname));
  });

  const traineesWithAttendance = computed(() => ([...course.value.trainees, ...unsubscribedTrainees.value]));

  const noTrainees = computed(() => !course.value.trainees.length);

  const courseHasSlot = computed(() => course.value.slots.length);

  const traineeFilterOptions = computed(() => {
    const formattedTrainees = formatAndSortIdentityOptions(potentialTrainees.value);

    return formattedTrainees.filter(trainee => !traineesWithAttendance.value.map(t => t._id).includes(trainee.value));
  });

  const disableCheckbox = computed(() => loading.value || !canUpdate.value || !!course.value.archivedAt);

  const clientRole = computed(() => $store.getters['main/getClientRole']);

  const vendorRole = computed(() => $store.getters['main/getVendorRole']);

  const canAccessLearnerProfile = computed(() => COACH_ROLES.includes(clientRole.value) ||
    [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(vendorRole.value));

  const traineesCount = slotId => attendances.value.filter(a => a.courseSlot === slotId).length;

  const getPotentialTrainees = async () => {
    try {
      let query;

      if (isClientInterface) query = { companies: get(loggedUser.value, 'company._id') };
      else query = { companies: course.value.companies.map(c => c._id) };

      potentialTrainees.value = !isEmpty(query.companies) ? Object.freeze(await Users.learnerList(query)) : [];
    } catch (error) {
      potentialTrainees.value = [];
      console.error(error);
    }
  };

  const attendanceCheckboxValue = (traineeId, slotId) => {
    if (attendances.value.length) {
      return !!attendances.value.find(a => a.trainee === traineeId && a.courseSlot === slotId);
    }
    return false;
  };

  const refreshAttendances = async (query) => {
    try {
      loading.value = true;
      if (!courseHasSlot.value) return;

      const updatedCourseSlot = await Attendances.list(query);

      attendances.value = query.courseSlot
        ? [...attendances.value.filter(a => a.courseSlot !== query.courseSlot), ...updatedCourseSlot]
        : updatedCourseSlot;
      NotifyPositive('Liste mise à jour.');
    } catch (e) {
      console.error(e);
      attendances.value = [];
      NotifyNegative('Erreur lors de la mise à jour des émargements.');
    } finally {
      loading.value = false;
    }
  };

  const updateAttendanceCheckbox = async (traineeId, slotId) => {
    try {
      if (!canUpdate.value) {
        NotifyNegative('Impossible de modifier l\'émargement.');
        return false;
      }

      loading.value = true;
      if (attendanceCheckboxValue(traineeId, slotId)) {
        await Attendances.delete({ trainee: traineeId, courseSlot: slotId });
      } else {
        await Attendances.create({ trainee: traineeId, courseSlot: slotId });
      }

      await refreshAttendances({ courseSlot: slotId });
      return true;
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la modification de l\'émargement.');
      return false;
    } finally {
      loading.value = false;
    }
  };

  const addTrainee = async () => {
    try {
      if (!canUpdate.value) return NotifyNegative('Impossible d\'ajouter un(e) participant(e).');

      v$.value.newTraineeAttendance.$touch();
      if (v$.value.newTraineeAttendance.$error) return NotifyWarning('Champs invalides');
      modalLoading.value = true;
      const promises = await Promise.all(newTraineeAttendance.value.attendances
        .map(s => updateAttendanceCheckbox(newTraineeAttendance.value.trainee, s)));
      traineeAdditionModal.value = false;
      if (promises.some(p => !!p)) NotifyPositive('Participant(e) ajouté(e).');
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de l\'ajout du/de la participant(e).');
    } finally {
      modalLoading.value = false;
    }
  };

  const resetNewTraineeAttendance = () => {
    v$.value.newTraineeAttendance.$reset();
    newTraineeAttendance.value = { trainee: '', attendances: [] };
  };

  const openTraineeAttendanceAdditionModal = () => {
    if (course.value.archivedAt) {
      return NotifyWarning('Vous ne pouvez pas ajouter un(e) participant(e) à une formation archivée.');
    }

    traineeAdditionModal.value = true;
  };

  const slotCheckboxValue = (slotId) => {
    const attendancesForRegisteredLearners = attendances.value.filter(a => a.courseSlot === slotId &&
      course.value.trainees.some(t => t._id === a.trainee));

    return attendancesForRegisteredLearners.length === course.value.trainees.length;
  };

  const updateSlotCheckbox = async (slotId) => {
    try {
      loading.value = true;
      if (!canUpdate.value) return NotifyNegative('Impossible d\'ajouter un(e) participant(e).');

      if (slotCheckboxValue(slotId)) await Attendances.delete({ courseSlot: slotId });
      else await Attendances.create({ courseSlot: slotId });

      await refreshAttendances({ courseSlot: slotId });
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la modification de l\'émargement.');
    } finally {
      loading.value = false;
    }
  };

  const goToLearnerProfile = (row) => {
    if (!canAccessLearnerProfile.value) return;

    const name = isClientInterface ? 'ni courses learners info' : 'ni users learners info';
    $router.push({ name, params: { learnerId: row._id } });
  };

  return {
    // Data
    attendances,
    traineeAdditionModal,
    newTraineeAttendance,
    potentialTrainees,
    loading,
    // Computed
    attendanceColumns,
    traineesWithAttendance,
    noTrainees,
    courseHasSlot,
    traineeFilterOptions,
    disableCheckbox,
    canAccessLearnerProfile,
    // Methods
    traineesCount,
    getPotentialTrainees,
    attendanceCheckboxValue,
    refreshAttendances,
    updateAttendanceCheckbox,
    slotCheckboxValue,
    addTrainee,
    resetNewTraineeAttendance,
    openTraineeAttendanceAdditionModal,
    updateSlotCheckbox,
    goToLearnerProfile,
    // Validations
    attendanceValidations: v$,
  };
};