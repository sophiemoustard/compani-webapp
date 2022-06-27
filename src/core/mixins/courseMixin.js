import get from 'lodash/get';
import set from 'lodash/set';
import { mapGetters } from 'vuex';
import Courses from '@api/Courses';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { INTRA, COURSE_TYPES, E_LEARNING, ON_SITE, STEP_TYPES } from '@data/constants';
import { formatIdentity, formatPhoneForPayload, readAPIResponseWithTypeArrayBuffer } from '@helpers/utils';
import moment from '@helpers/moment';
import { downloadFile } from '@helpers/file';

export const courseMixin = {
  data () {
    return {
      pdfLoading: false,
      isVendorInterface: /\/ad\//.test(this.$route.path),
    };
  },
  computed: {
    ...mapGetters({ vendorRole: 'main/getVendorRole' }),
    isIntraCourse () {
      return get(this.course, 'type') === INTRA;
    },
    courseType () {
      const type = COURSE_TYPES.find(t => t.value === get(this.course, 'type'));
      return type ? type.label : '';
    },
    trainerName () {
      return formatIdentity(get(this.course, 'trainer.identity'), 'FL');
    },
    followUpDisabled () {
      return this.followUpMissingInfo.length > 0;
    },
    followUpMissingInfo () {
      const missingInfo = [];
      if (!this.course.trainer) missingInfo.push('l\'intervenant(e)');
      if (!this.course.slots || !this.course.slots.length) missingInfo.push('minimum 1 créneau');
      if (!this.course.trainees || !this.course.trainees.length) missingInfo.push('minimum 1 stagiaire');

      if (!get(this.course, 'contact._id')) missingInfo.push('le contact pour la formation');
      else if (!get(this.course, 'contact.contact.phone')) missingInfo.push('le numéro du contact pour la formation');

      return missingInfo;
    },
    headerInfo () {
      return [
        { icon: 'bookmark_border', label: this.courseType },
        { icon: 'emoji_people', label: this.trainerName },
        ...(this.course.archivedAt ? [{ icon: 'circle', label: 'Archivée', iconClass: 'info-archived' }] : []),
      ];
    },
    disableDocDownload () {
      return this.followUpDisabled || this.pdfLoading;
    },
    isArchived () {
      return !!this.course.archivedAt;
    },
    isIntraOrVendor () {
      return this.isIntraCourse || this.isVendorInterface;
    },
  },
  methods: {
    happened (sameDaySlots) {
      return moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);
    },
    saveTmp (path) {
      this.tmpInput = this.getValue(path);
    },
    formatUpdateCourseValue (path, value) {
      return path === 'contact.phone' ? formatPhoneForPayload(value) : value;
    },
    composeCourseName (c, attachCompany = false) {
      const companyName = (attachCompany && c.company) ? `${c.company.name} - ` : '';
      const misc = c.misc ? ` - ${c.misc}` : '';
      return companyName + c.subProgram.program.name + misc;
    },
    getValue (path) {
      if (path === 'trainer') return get(this.course, 'trainer._id', '');
      if (path === 'salesRepresentative') return get(this.course, 'salesRepresentative._id', '');
      if (path === 'contact') return get(this.course, 'contact._id', '');

      return get(this.course, path);
    },
    getVAttribute (path) {
      if (path === 'trainer') return get(this.v$.course, 'trainer._id', '');
      if (path === 'salesRepresentative') return get(this.v$.course, 'salesRepresentative._id', '');
      if (path === 'contact') return '';

      return get(this.v$.course, path);
    },
    async updateCourse (path) {
      try {
        const value = this.getValue(path);
        if (this.tmpInput === value) return;

        const vAttribute = this.getVAttribute(path);
        if (vAttribute) {
          vAttribute.$touch();
          if (vAttribute.$error) return NotifyWarning('Champ(s) invalide(s).');
        }

        const payload = set({}, path, this.formatUpdateCourseValue(path, value));
        await Courses.update(this.profileId, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshCourse();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = null;
      }
    },
    getStepTypeIcon (type) {
      if (type === E_LEARNING) return 'stay_current_portrait';
      if (type === ON_SITE) return 'mdi-teach';
      return 'videocam';
    },
    getStepTypeLabel (value) {
      const type = STEP_TYPES.find(t => t.value === value);
      return type ? type.label : '';
    },
    async downloadAttendanceSheet () {
      if (this.disableDocDownload) return;

      try {
        this.pdfLoading = true;
        const pdf = await Courses.downloadAttendanceSheet(this.course._id);
        const formattedName = this.composeCourseName(this.course, true)
          .replaceAll(' - ', '_')
          .replaceAll(' ', '_')
          .replaceAll('\'', '_');
        const pdfName = `feuilles_d_emargement_${formattedName}.pdf`;
        downloadFile(pdf, pdfName, 'application/octet-stream');
      } catch (e) {
        console.error(e);
        const decodedRep = readAPIResponseWithTypeArrayBuffer(e);
        if (decodedRep.statusCode === 404 && decodedRep.message) return NotifyNegative(decodedRep.message);
        NotifyNegative('Erreur lors du téléchargement de la feuille d\'émargement.');
      } finally {
        this.pdfLoading = false;
      }
    },
  },
};
