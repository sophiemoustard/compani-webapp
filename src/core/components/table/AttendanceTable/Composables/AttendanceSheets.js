import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import get from 'lodash/get';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import AttendanceSheets from '@api/AttendanceSheets';
import { INTRA, INTER_B2B, DD_MM_YYYY } from '@data/constants';
import { formatIdentity, sortStrings } from '@helpers/utils';
import CompaniDate from '@helpers/dates/companiDates';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';

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
  const attendanceSheets = ref([]);
  const newAttendanceSheet = ref({ course: course.value._id });
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
      label: 'Participant(e)',
      align: 'left',
      field: row => formatIdentity(get(row, 'trainee.identity'), 'FL'),
    },
    { name: 'actions', label: '', align: 'left' },
  ]);

  const attendanceSheetRules = computed(() => ({
    newAttendanceSheet: {
      file: { required },
      trainee: { required: requiredIf(course.value.type !== INTRA) },
      date: { required: requiredIf(course.value.type === INTRA) },
    },
  }));

  const v$ = useVuelidate(attendanceSheetRules, { newAttendanceSheet });

  const attendanceSheetVisibleColumns = computed(() => (course.value.type === INTRA
    ? ['date', 'actions']
    : ['trainee', 'actions']));

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

  const disableSheetDeletion = attendanceSheet => !attendanceSheet.file.link || !!course.value.archivedAt;

  const refreshAttendanceSheets = async () => {
    try {
      attendanceSheetTableLoading.value = true;
      const attendanceSheetList = await AttendanceSheets.list({ course: course.value._id });

      if (course.value.type === INTER_B2B && isClientInterface) {
        attendanceSheets.value = attendanceSheetList.filter(a => a.company === loggedUser.value.company._id);
      } else attendanceSheets.value = attendanceSheetList;
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

    attendanceSheetAdditionModal.value = true;
  };

  const resetAttendanceSheetAdditionModal = () => {
    v$.value.newAttendanceSheet.$reset();
    newAttendanceSheet.value = { course: course.value._id };
  };

  const formatPayload = () => {
    const { course: newAttendanceSheetCourse, file, trainee, date } = newAttendanceSheet.value;
    const form = new FormData();
    course.value.type === INTRA ? form.append('date', date) : form.append('trainee', trainee);
    form.append('course', newAttendanceSheetCourse);
    form.append('file', file);

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
      message: 'Êtes-vous sûr(e) de vouloir supprimer cette feuille d\'émargement&nbsp;?',
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

  return {
    // Data
    attendanceSheetTableLoading,
    attendanceSheetAdditionModal,
    attendanceSheets,
    newAttendanceSheet,
    attendanceSheetColumns,
    // Computed
    attendanceSheetVisibleColumns,
    formattedAttendanceSheets,
    // Methods
    disableSheetDeletion,
    refreshAttendanceSheets,
    openAttendanceSheetAdditionModal,
    resetAttendanceSheetAdditionModal,
    addAttendanceSheet,
    validateAttendanceSheetDeletion,
    deleteAttendanceSheet,
    // Validations
    attendanceSheetValidations: v$,
  };
};
