import {
  ABSENCE_TYPES,
  DAILY,
  ABSENCE,
  STAFFING_VIEW_START_HOUR,
  STAFFING_VIEW_END_HOUR,
} from '../data/constants';
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
    getDisplayedEvent (event, day, startDisplay, endDisplay) {
      let dayEvent = { ...event };
      const eventStartDate = this.$moment(event.startDate);
      const eventEndDate = this.$moment(event.endDate);
      let displayedStartHour = eventStartDate.hours();
      let displayedEndHour = eventEndDate.hours();
      let displayedStartMinutes = eventStartDate.minutes();
      let displayedEndMinutes = eventEndDate.minutes();

      if (event.type === ABSENCE && event.absenceNature === DAILY) {
        displayedStartHour = STAFFING_VIEW_START_HOUR;
        displayedEndHour = STAFFING_VIEW_END_HOUR;
        displayedStartMinutes = 0;
        displayedEndMinutes = 0;
      }

      let staffingBeginning = Math.max((displayedStartHour - startDisplay) * 60 + displayedStartMinutes, 0);
      let staffingEnd = Math.min((displayedEndHour - startDisplay) * 60 + displayedEndMinutes, (endDisplay - startDisplay) * 60 + displayedEndMinutes);

      dayEvent.startDate = this.$moment(day).hour(displayedStartHour).minutes(displayedStartMinutes).toISOString();
      dayEvent.endDate = this.$moment(day).hour(displayedEndHour).minutes(displayedEndMinutes).toISOString();
      dayEvent.staffingBeginning = staffingBeginning;
      dayEvent.staffingDuration = staffingEnd - staffingBeginning;

      return dayEvent;
    },
  },
};
