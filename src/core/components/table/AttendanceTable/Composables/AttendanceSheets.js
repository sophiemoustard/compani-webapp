import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import groupBy from 'lodash/groupBy';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import AttendanceSheets from '@api/AttendanceSheets';
import { INTER_B2B, DD_MM_YYYY } from '@data/constants';
import { formatIdentity, sortStrings } from '@helpers/utils';
import CompaniDate from '@helpers/dates/companiDates';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';

const SINGLE_COURSES_SUBPROGRAM_IDS = process.env.SINGLE_COURSES_SUBPROGRAM_IDS.split(';');

export const useAttendanceSheets = (
  course,
  isClientInterface,
  canUpdate,
  loggedUser,
  modalLoading
) => {
  const $q = useQuasar();
  const attendanceSheetTableLoading = ref(false);
  const attendanceSheetAdditionModal = ref(false);
  const attendanceSheetEditionModal = ref(false);
  const attendanceSheets = ref([]);
  const newAttendanceSheet = ref({ course: course.value._id });
  const editedAttendanceSheet = ref({ _id: '', slots: [], trainee: {} });
  const editionSlotsGroupedByStep = ref([]);
  const attendanceSheetColumns = ref([
    {
      name: 'date',
      label: 'Date',
      align: 'left',
      field: 'date',
      format: value => CompaniDate(value).format(DD_MM_YYYY),
    },
    {
      name: 'trainee',
      label: 'Participant·e',
      align: 'left',
      field: row => formatIdentity(get(row, 'trainee.identity'), 'FL'),
    },
    { name: 'actions', label: '', align: 'left' },
  ]);
  const stepsById = ref(keyBy(course.value.subProgram.steps, '_id'));

  const isSingleCourse = computed(() => SINGLE_COURSES_SUBPROGRAM_IDS.includes(course.value.subProgram._id));

  const attendanceSheetRules = computed(() => ({
    newAttendanceSheet: {
      file: { required },
      trainee: { required: requiredIf(course.value.type === INTER_B2B) },
      date: { required: requiredIf(course.value.type !== INTER_B2B) },
      slots: { required: requiredIf(isSingleCourse.value) },
    },
    editedAttendanceSheet: { slots: { required: requiredIf(isSingleCourse.value) } },
  }));

  const v$ = useVuelidate(attendanceSheetRules, { newAttendanceSheet, editedAttendanceSheet });

  const attendanceSheetVisibleColumns = computed(() => (course.value.type === INTER_B2B
    ? ['trainee', 'actions']
    : ['date', 'actions']));

  const unsubscribedTrainees = computed(() => {
    const traineesId = course.value.trainees.map(trainee => trainee._id);

    const unsubscribedTraineeList = attendanceSheets.value
      .filter(a => (!traineesId.includes(a.trainee._id)))
      .map(a => a.trainee);

    if (!unsubscribedTraineeList.length) return [];

    return unsubscribedTraineeList
      .map(t => ({ ...t, external: true }))
      .sort((a, b) => sortStrings(a.identity.lastname, b.identity.lastname));
  });

  const traineesWithAttendanceSheet = computed(() => ([...course.value.trainees, ...unsubscribedTrainees.value]));

  const formattedAttendanceSheets = computed(() => {
    if (course.value.type === INTER_B2B) {
      return attendanceSheets.value.map(as => ({
        ...as,
        trainee: traineesWithAttendanceSheet.value.find(trainee => trainee._id === as.trainee._id),
      }));
    }
    return attendanceSheets.value;
  });

  const notLinkedSlotOptions = computed(() => {
    if (!isSingleCourse.value) return [];

    return course.value.slots
      .filter(s => attendanceSheets.value.every(as => !get(as, 'slots', []).map(slot => slot._id).includes(s._id)));
  });

  const disableSheetDeletion = attendanceSheet => !attendanceSheet.file.link || !!course.value.archivedAt;

  const disableSheetEdition = () => !!course.value.archivedAt;

  const refreshAttendanceSheets = async () => {
    try {
      attendanceSheetTableLoading.value = true;
      const loggedUserHolding = get(loggedUser.value, 'holding._id');
      const attendanceSheetList = await AttendanceSheets.list({
        course: course.value._id,
        ...(isClientInterface && {
          ...loggedUserHolding ? { holding: loggedUserHolding } : { company: loggedUser.value.company._id },
        }),
      });

      attendanceSheets.value = attendanceSheetList;
    } catch (e) {
      console.error(e);
      attendanceSheets.value = [];
      NotifyNegative('Erreur lors de la récupération des feuilles d\'émargement.');
    } finally {
      attendanceSheetTableLoading.value = false;
    }
  };

  const openAttendanceSheetAdditionModal = () => {
    if (course.value.archivedAt) {
      return NotifyWarning('Vous ne pouvez pas ajouter de feuilles d\'émargement à une formation archivée.');
    }
    if (!course.value.companies.length) {
      return NotifyWarning('Au moins une structure doit être rattachée à la formation.');
    }
    if (isSingleCourse.value) {
      if (!notLinkedSlotOptions.value.length) {
        return NotifyWarning('Tous les créneaux sont déjà rattachés à une feuille d\'émargement.');
      }
      newAttendanceSheet.value.slots = [];
    }

    attendanceSheetAdditionModal.value = true;
  };

  const resetAttendanceSheetAdditionModal = () => {
    v$.value.newAttendanceSheet.$reset();
    newAttendanceSheet.value = { course: course.value._id };
  };

  const formatPayload = () => {
    const { course: newAttendanceSheetCourse, file, trainee, date, slots } = newAttendanceSheet.value;
    const form = new FormData();
    course.value.type === INTER_B2B ? form.append('trainee', trainee) : form.append('date', date);
    form.append('course', newAttendanceSheetCourse);
    form.append('file', file);

    if (isSingleCourse.value) slots.forEach(slot => form.append('slots', slot));

    return form;
  };

  const addAttendanceSheet = async () => {
    try {
      if (!canUpdate.value) return NotifyNegative('Impossible d\'ajouter une feuille d\'émargement.');

      v$.value.newAttendanceSheet.$touch();
      if (v$.value.newAttendanceSheet.$error) return NotifyWarning('Champ(s) invalide(s)');
      modalLoading.value = true;

      await AttendanceSheets.create(formatPayload());

      attendanceSheetAdditionModal.value = false;
      NotifyPositive('Feuille d\'émargement ajoutée.');
      await refreshAttendanceSheets();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de l\'ajout de la feuille d\'émargement.');
    } finally {
      modalLoading.value = false;
    }
  };

  const validateAttendanceSheetDeletion = (attendanceSheet) => {
    if (!canUpdate.value) return NotifyNegative('Impossible de supprimer la feuille d\'émargement.');

    $q.dialog({
      title: 'Confirmation',
      message: 'Êtes-vous sûr·e de vouloir supprimer cette feuille d\'émargement&nbsp;?',
      html: true,
      ok: true,
      cancel: 'Annuler',
    }).onOk(() => deleteAttendanceSheet(attendanceSheet._id))
      .onCancel(() => NotifyPositive('Suppression annulée.'));
  };

  const deleteAttendanceSheet = async (attendanceSheetId) => {
    try {
      $q.loading.show();
      await AttendanceSheets.delete(attendanceSheetId);

      NotifyPositive('Feuille d\'émargement supprimée.');
      await refreshAttendanceSheets();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de la suppresion de la feuille d\'émargement.');
    } finally {
      $q.loading.hide();
    }
  };

  const openAttendanceSheetEditionModal = (attendanceSheet) => {
    const linkedSlots = attendanceSheet.slots || [];
    if (![...linkedSlots, ...notLinkedSlotOptions.value].length) {
      return NotifyWarning('Tous les créneaux sont déjà rattachés à une feuille d\'émargement.');
    }

    editedAttendanceSheet.value = {
      _id: attendanceSheet._id,
      slots: linkedSlots.map(slot => slot._id),
      trainee: attendanceSheet.trainee,
    };

    const groupedSlots = groupBy([...linkedSlots, ...notLinkedSlotOptions.value], 'step');
    editionSlotsGroupedByStep.value = Object.keys(stepsById.value).reduce((acc, step) => {
      if (groupedSlots[step]) {
        acc[step] = groupedSlots[step];
      }
      return acc;
    }, {});

    attendanceSheetEditionModal.value = true;
  };

  const updateAttendanceSheet = async () => {
    try {
      if (!canUpdate.value) return NotifyNegative('Impossible d\'éditer la feuille d\'émargement.');

      v$.value.editedAttendanceSheet.$touch();
      if (v$.value.editedAttendanceSheet.$error) return NotifyWarning('Champs(s) invalide(s)');
      modalLoading.value = true;

      await AttendanceSheets.update(editedAttendanceSheet.value._id, { slots: editedAttendanceSheet.value.slots });

      attendanceSheetEditionModal.value = false;
      NotifyPositive('Feuille d\'émargement modifiée.');
      await refreshAttendanceSheets();
    } catch (e) {
      console.error(e);
      NotifyNegative('Erreur lors de l\'édition de la feuille d\'émargement.');
    } finally {
      modalLoading.value = false;
    }
  };

  const resetAttendanceSheetEditionModal = () => {
    v$.value.editedAttendanceSheet.$reset();
    editedAttendanceSheet.value = { _id: '', slots: [], trainee: {} };
    editionSlotsGroupedByStep.value = [];
  };

  return {
    // Data
    attendanceSheetTableLoading,
    attendanceSheetAdditionModal,
    attendanceSheets,
    newAttendanceSheet,
    attendanceSheetColumns,
    attendanceSheetEditionModal,
    editedAttendanceSheet,
    stepsById,
    // Computed
    attendanceSheetVisibleColumns,
    formattedAttendanceSheets,
    notLinkedSlotOptions,
    editionSlotsGroupedByStep,
    isSingleCourse,
    // Methods
    disableSheetDeletion,
    disableSheetEdition,
    refreshAttendanceSheets,
    openAttendanceSheetAdditionModal,
    resetAttendanceSheetAdditionModal,
    addAttendanceSheet,
    validateAttendanceSheetDeletion,
    deleteAttendanceSheet,
    openAttendanceSheetEditionModal,
    updateAttendanceSheet,
    resetAttendanceSheetEditionModal,
    // Validations
    attendanceSheetValidations: v$,
  };
};
