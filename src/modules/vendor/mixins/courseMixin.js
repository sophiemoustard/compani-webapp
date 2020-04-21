import get from 'lodash/get';

export const courseMixin = {
  computed: {
    courseType () {
      return get(this.course, 'type') || '';
    },
    companyName () {
      if (!get(this.course, 'companies') || !this.course.companies.length) return '';
      return this.course.companies[0].tradeName || '';
    },
    programName () {
      return get(this.course, 'program.name') || '';
    },
  },
}
