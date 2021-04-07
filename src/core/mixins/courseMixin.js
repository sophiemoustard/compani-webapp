import get from 'lodash/get';
import set from 'lodash/set';
import { mapGetters } from 'vuex';
import Courses from '@api/Courses';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { INTRA, COURSE_TYPES } from '@data/constants';
import { formatIdentity, formatPhoneForPayload } from '@helpers/utils';
import moment from '@helpers/moment';

export const courseMixin = {
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
      if (!this.course.trainer) missingInfo.push('l\'intervenant');
      if (!this.course.slots || !this.course.slots.length) missingInfo.push('minimum 1 créneau');
      if (!this.course.trainees || !this.course.trainees.length) missingInfo.push('minimum 1 stagiaire');
      if (!get(this.course, 'contact.name')) missingInfo.push('le nom du contact pour la formation');
      if (!get(this.course, 'contact.phone')) missingInfo.push('le numéro du contact pour la formation');

      return missingInfo;
    },
    headerInfo () {
      return [
        { icon: 'bookmark_border', label: this.courseType },
        { icon: 'emoji_people', label: this.trainerName },
      ];
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

      return get(this.course, path);
    },
    async updateCourse (path) {
      try {
        const value = this.getValue(path);
        if (this.tmpInput === value) return;

        const vAttribute = path === 'trainer' ? get(this.$v.course, 'trainer._id') : get(this.$v.course, path);
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
  },
};
