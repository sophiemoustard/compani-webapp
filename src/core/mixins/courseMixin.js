import get from 'lodash/get';
import Companies from '@api/Companies';
import { mapGetters } from 'vuex';
import { VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER, INTRA, COURSE_TYPES } from '@data/constants';
import { formatIdentity } from '@helpers/utils';

export const courseMixin = {
  computed: {
    ...mapGetters({ vendorRole: 'main/vendorRole' }),
    companyName () {
      return get(this.course, 'company.tradeName') || '';
    },
    programName () {
      return get(this.course, 'program.name') || '';
    },
    isAdmin () {
      return [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(this.vendorRole);
    },
    isIntraCourse () {
      return get(this.course, 'type') === INTRA;
    },
    courseType () {
      const type = COURSE_TYPES.find(t => t.value === get(this.course, 'type'));
      return type ? type.label : '';
    },
    headerInfo () {
      const infos = [
        { icon: 'library_books', label: this.programName },
        { icon: 'bookmark_border', label: this.courseType },
        { icon: 'emoji_people', label: this.trainerName },
      ]
      if (this.isIntraCourse) infos.push({ icon: 'apartment', label: this.companyName });

      return infos;
    },
    trainerName () {
      return formatIdentity(get(this.course, 'trainer.identity'), 'FL');
    },
    courseListForthcoming () {
      return this.courses
        .filter(this.isForthcoming)
        .sort((a, b) => this.getRangeNowToStartCourse(a) - this.getRangeNowToStartCourse(b));
    },
    courseListInProgress () {
      return this.courses
        .filter(this.isInProgress)
        .sort((a, b) => this.getRangeNowToNextSlot(a) - this.getRangeNowToNextSlot(b));
    },
    courseListCompleted () {
      return this.courses
        .filter(this.isCompleted)
        .sort((a, b) => this.getRangeNowToEndCourse(a) - this.getRangeNowToEndCourse(b));
    },
    trello () {
      return [
        { title: 'À venir', courses: this.courseListForthcoming },
        { title: 'En cours', courses: this.courseListInProgress },
        { title: 'Terminée(s)', courses: this.courseListCompleted },
      ]
    },
  },
  methods: {
    async refreshCompanies () {
      try {
        const companies = await Companies.list();
        this.companyOptions = companies
          .map(c => ({ label: c.tradeName, value: c._id }))
          .sort((a, b) => a.label.localeCompare(b.label));
      } catch (e) {
        console.error(e);
        this.companyOptions = [];
      }
    },
    happened (sameDaySlots) {
      return this.$moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);
    },
    isForthcoming (course) {
      const noSlot = !course.slots.length;
      const noSlotHappened = !course.slots.some(this.happened);

      return noSlot || noSlotHappened;
    },
    isInProgress (course) {
      const atLeastOneSlot = course.slots.length;
      const atLeastOneSlothappened = course.slots.some(this.happened);
      const notEverySlotsHappened = course.slots.some((sameDaySlots) => !this.happened(sameDaySlots));

      return atLeastOneSlot && atLeastOneSlothappened && notEverySlotsHappened;
    },
    isCompleted (course) {
      const atLeastOneSlot = course.slots.length;
      const everySlotsHappened = course.slots.every(this.happened);

      return atLeastOneSlot && everySlotsHappened;
    },
    getRangeNowToStartCourse (course) {
      if (course.slots.length === 0) return Number.MAX_SAFE_INTEGER;

      const firstSlot = course.slots[0];
      return this.$moment(firstSlot[0].startDate).diff(this.$moment(), 'd', true);
    },
    getRangeNowToNextSlot (course) {
      const nextSlot = course.slots.filter((daySlots) => !this.happened(daySlots))[0];
      return this.$moment(nextSlot[0].startDate).diff(this.$moment(), 'd', true);
    },
    getRangeNowToEndCourse (course) {
      const lastSlot = course.slots[course.slots.length - 1];
      return this.$moment().diff(this.$moment(lastSlot[0].startDate), 'd', true);
    },
  },
}
