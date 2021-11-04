import get from 'lodash/get';
import set from 'lodash/set';
import { mapGetters } from 'vuex';
import Courses from '@api/Courses';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { INTRA, COURSE_TYPES, E_LEARNING, ON_SITE, STEP_TYPES } from '@data/constants';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { formatIdentity, formatPhoneForPayload } from '@helpers/utils';
import { downloadFile } from '@helpers/file';
import moment from '@helpers/moment';

export const courseMixin = {
  data () {
    return { pdfLoading: false };
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
      if (!get(this.course, 'contact.name')) missingInfo.push('le nom du contact pour la formation');
      const phone = get(this.course, 'contact.phone');
      if (!phone || !frPhoneNumber(phone)) missingInfo.push('le numéro du contact pour la formation');

      return missingInfo;
    },
    headerInfo () {
      return [
        { icon: 'bookmark_border', label: this.courseType },
        { icon: 'emoji_people', label: this.trainerName },
      ];
    },
    headerInfoWithArchivedIcon () {
      return [
        ...this.headerInfo,
        ...(get(this, 'course.archivedAt') ? [{ icon: 'circle', label: 'Archivée', iconClass: 'info-archived' }] : []),
      ];
    },
    disableDocDownload () {
      return this.followUpDisabled || this.pdfLoading;
    },
  },
  methods: {
    happened (sameDaySlots) {
      return moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);
    },
    padMinutes (minutes) {
      return minutes > 0 && minutes < 10 ? minutes.toString().padStart(2, 0) : minutes;
    },
    saveTmp (path) {
      this.tmpInput = this.getValue(path);
    },
    formatUpdateCourseValue (path, value) {
      return path === 'contact.phone' ? formatPhoneForPayload(value) : value;
    },
    composeCourseName (c, attachCompany = false) {
      const possiblyCompanyName = (attachCompany && c.company) ? `${c.company.name} - ` : '';
      const possiblyMisc = c.misc ? ` - ${c.misc}` : '';
      return possiblyCompanyName + c.subProgram.program.name + possiblyMisc;
    },
    getValue (path) {
      if (path === 'trainer') return get(this.course, 'trainer._id', '');
      if (path === 'salesRepresentative') return get(this.course, 'salesRepresentative._id', '');

      return get(this.course, path);
    },
    getVAttribute (path) {
      if (path === 'trainer') return get(this.$v.course, 'trainer._id', '');
      if (path === 'salesRepresentative') return get(this.$v.course, 'salesRepresentative._id', '');

      return get(this.$v.course, path);
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
    async downloadConvocation () {
      if (this.disableDocDownload) return;

      try {
        this.pdfLoading = true;
        const pdf = await Courses.downloadConvocation(this.course._id);
        downloadFile(pdf, 'convocation.pdf');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement de la convocation.');
      } finally {
        this.pdfLoading = false;
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
  },
};
