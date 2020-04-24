import get from 'lodash/get';
import { mapGetters } from 'vuex';
import { VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER } from '@data/constants';

export const courseMixin = {
  computed: {
    ...mapGetters({ vendorRole: 'main/vendorRole' }),
    companyName () {
      if (!get(this.course, 'companies') || !this.course.companies.length) return '';
      return this.course.companies[0].tradeName || '';
    },
    programName () {
      return get(this.course, 'program.name') || '';
    },
    isAdmin () {
      return [VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER].includes(this.vendorRole);
    },
  },
  methods: {
    happened (sameDaySlots) {
      return this.$moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);
    },
  },
}
