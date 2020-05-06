import get from 'lodash/get';
import { mapGetters } from 'vuex';
import { VENDOR_ADMIN, TRAINING_ORGANISATION_MANAGER, INTRA } from '@data/constants';
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
    headerInfo () {
      if (this.isIntraCourse) {
        return [
          { icon: 'library_books', label: `${this.programName}` },
          { icon: 'apartment', label: `${this.companyName}` },
          { icon: 'emoji_people', label: `${this.trainerName}` },
        ];
      }

      return [
        { icon: 'library_books', label: `${this.programName}` },
        { icon: 'emoji_people', label: `${this.trainerName}` },
      ];
    },
    trainerName () {
      return formatIdentity(get(this.course, 'trainer.identity'), 'FL');
    },
  },
  methods: {
    happened (sameDaySlots) {
      return this.$moment().isSameOrAfter(sameDaySlots[sameDaySlots.length - 1].endDate);
    },
  },
}
