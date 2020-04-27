import get from 'lodash/get';

export const courseMixin = {
  computed: {
    companyName () {
      if (!get(this.course, 'companies') || !this.course.companies.length) return '';
      return this.course.companies[0].tradeName || '';
    },
    programName () {
      return get(this.course, 'program.name') || '';
    },
  },
  methods: {
    happened (sameDaySlots) {
      return this.$moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);
    },
  },
}
