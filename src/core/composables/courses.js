import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import get from 'lodash/get';
import set from 'lodash/set';
import Courses from '@api/Courses';
import { INTRA, COURSE_TYPES, E_LEARNING, ON_SITE, STEP_TYPES } from '@data/constants';
import {
  formatIdentity,
  formatDownloadName,
  readAPIResponseWithTypeArrayBuffer,
  formatPhoneForPayload,
} from '@helpers/utils';
import { downloadFile } from '@helpers/file';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import moment from '@helpers/moment';

export const useCourses = (refreshCourse, course, tmpInput, v$) => {
  const $router = useRouter();
  const pdfLoading = ref(false);
  const isVendorInterface = /\/ad\//.test($router.currentRoute.value.path);
  const $store = useStore();

  const clientRole = computed(() => $store.getters['main/getVendorRole']);
  const isIntraCourse = computed(() => (get(course.value, 'type') === INTRA));
  const courseType = computed(() => {
    const type = COURSE_TYPES.find(t => t.value === get(course.value, 'type'));
    return type ? type.label : '';
  });
  const trainerName = computed(() => formatIdentity(get(course.value, 'trainer.identity'), 'FL'));
  const followUpDisabled = computed(() => followUpMissingInfo.value.length > 0);
  const followUpMissingInfo = computed(() => {
    const missingInfo = [];
    if (!course.value.trainer._id) missingInfo.push('l\'intervenant(e)');
    if (!course.value.slots || !course.value.slots.length) missingInfo.push('minimum 1 créneau');
    if (!course.value.trainees || !course.value.trainees.length) missingInfo.push('minimum 1 stagiaire');

    if (!get(course.value, 'contact._id')) missingInfo.push('le contact pour la formation');
    else if (!get(course.value, 'contact.contact.phone')) missingInfo.push('le numéro du contact pour la formation');

    return missingInfo;
  });
  const headerInfo = computed(() => [
    { icon: 'bookmark_border', label: courseType.value },
    { icon: 'emoji_people', label: trainerName.value },
    ...(course.value.archivedAt ? [{ icon: 'circle', label: 'Archivée', iconClass: 'info-archived' }] : []),
  ]);
  const disableDocDownload = computed(() => followUpDisabled.value || pdfLoading.value);
  const isArchived = computed(() => !!course.value.archivedAt);
  const isIntraOrVendor = computed(() => isIntraCourse.value || isVendorInterface);

  const happened = sameDaySlots => moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);

  const saveTmp = (path) => {
    tmpInput = getValue(path);
  };
  const formatUpdateCourseValue = (path, value) => (path === 'contact.phone' ? formatPhoneForPayload(value) : value);

  const composeCourseName = (c, attachCompany = false) => {
    const companyName = (attachCompany && c.company) ? `${c.company.name} - ` : '';
    const misc = c.misc ? ` - ${c.misc}` : '';
    return companyName + c.subProgram.program.name + misc;
  };

  const getValue = (path) => {
    if (path === 'trainer') return get(course.value, 'trainer._id', '');
    if (path === 'salesRepresentative') return get(course.value, 'salesRepresentative._id', '');
    if (path === 'contact') return get(course.value, 'contact._id', '');

    return get(course.value, path);
  };

  const getVAttribute = (path) => {
    if (path === 'trainer') return get(v$.course, 'trainer._id', '');
    if (path === 'salesRepresentative') return get(v$.course, 'salesRepresentative._id', '');
    if (path === 'contact') return '';

    return get(v$.course, path);
  };

  const updateCourse = async (path) => {
    try {
      const value = getValue(path);
      if (tmpInput === value) return;

      const vAttribute = getVAttribute(path);
      if (vAttribute) {
        vAttribute.$touch();
        if (vAttribute.$error) return NotifyWarning('Champ(s) invalide(s).');
      }

      const payload = set({}, path, formatUpdateCourseValue(path, value));
      await Courses.update(this.profileId, payload);
      NotifyPositive('Modification enregistrée.');

      await refreshCourse();
    } catch (e) {
      console.error(e);
      if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message);
      NotifyNegative('Erreur lors de la modification.');
    } finally {
      tmpInput = null;
    }
  };

  const getStepTypeIcon = (type) => {
    if (type === E_LEARNING) return 'stay_current_portrait';
    if (type === ON_SITE) return 'mdi-teach';
    return 'videocam';
  };

  const getStepTypeLabel = (value) => {
    const type = STEP_TYPES.find(t => t.value === value);
    return type ? type.label : '';
  };

  const downloadAttendanceSheet = async () => {
    if (disableDocDownload.value) return;

    try {
      pdfLoading.value = true;
      const pdf = await Courses.downloadAttendanceSheet(course.value._id);
      const formattedName = formatDownloadName(`feuilles d'emargement ${composeCourseName(course.value, true)}`);
      const pdfName = `${formattedName}.pdf`;
      downloadFile(pdf, pdfName, 'application/octet-stream');
    } catch (e) {
      console.error(e);
      const decodedRep = readAPIResponseWithTypeArrayBuffer(e);
      if (decodedRep.statusCode === 404 && decodedRep.message) return NotifyNegative(decodedRep.message);
      NotifyNegative('Erreur lors du téléchargement de la feuille d\'émargement.');
    } finally {
      pdfLoading.value = false;
    }
  };

  return {
    // Data
    pdfLoading,
    isVendorInterface,
    // Computed
    clientRole,
    isIntraCourse,
    courseType,
    trainerName,
    followUpDisabled,
    followUpMissingInfo,
    headerInfo,
    disableDocDownload,
    isArchived,
    isIntraOrVendor,
    // Methods
    happened,
    saveTmp,
    formatUpdateCourseValue,
    composeCourseName,
    getValue,
    getVAttribute,
    updateCourse,
    getStepTypeIcon,
    getStepTypeLabel,
    downloadAttendanceSheet,
  };
};