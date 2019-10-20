import { ABSENCE_TYPES } from '../data/constants';
import { formatIdentity } from '../helpers/utils';

export const planningEventMixin = {
  data () {
    return {
      hours: [],
    };
  },
  computed: {
    daysHeader () {
      if (!this.days) return [];
      return this.days.map(day => {
        return {
          name: this.$moment(day).format('dd'),
          number: this.$moment(day).format('DD'),
          moment: day,
        }
      });
    },
    isCustomerPlanning () {
      return this.personKey === 'customer';
    },
  },
  methods: {
    isCurrentDay (momentDay) {
      return this.$moment(momentDay).isSame(new Date(), 'day');
    },
    getEventHours (event) {
      return `${this.$moment(event.startDate).format('HH:mm')} - ${this.$moment(event.endDate).format('HH:mm')}`
    },
    displayAbsenceType (value) {
      const absence = ABSENCE_TYPES.find(abs => abs.value === value);
      return !absence ? '' : absence.label;
    },
    eventTitle (event) {
      if (!event.auxiliary && this.isCustomerPlanning) return 'À affecter';

      return this.isCustomerPlanning ? formatIdentity(event.auxiliary.identity, 'Fl') : formatIdentity(event.customer.identity, 'fL');
    },
  },
};
