import {
  CUSTOMER,
  ABSENCE_TYPES,
  DAILY,
  ABSENCE,
  STAFFING_VIEW_START_HOUR,
  ILLNESS,
  WORK_ACCIDENT,
  CUSTOMER_ABSENCE_TYPES,
} from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import moment from '@helpers/moment';

export const planningEventMixin = {
  data () {
    return {
      hours: [],
    };
  },
  computed: {
    daysHeader () {
      if (!this.days) return [];
      return this.days.map(day => ({
        name: moment(day).format('dd'),
        number: moment(day).format('DD'),
        moment: day,
      }));
    },
    isCustomerPlanning () {
      return this.personKey === CUSTOMER;
    },
  },
  methods: {
    isHoliday (day) {
      return moment(day).startOf('day').isHoliday();
    },
    isCurrentDay (momentDay) {
      return moment(momentDay).isSame(new Date(), 'day');
    },
    getEventStartHour (event) {
      return `${moment(event.displayedStartDate).format('HH:mm')}`;
    },
    getEventEndHour (event) {
      return `${moment(event.displayedEndDate).format('HH:mm')}`;
    },
    displayAbsenceType (value) {
      const absence = ABSENCE_TYPES.find(abs => abs.value === value);
      return !absence ? '' : absence.label;
    },
    displayCustomerAbsenceType (value) {
      const customerAbsence = CUSTOMER_ABSENCE_TYPES.find(abs => abs.value === value);
      return !customerAbsence ? '' : customerAbsence.label;
    },
    eventTitle (event) {
      if (!event.auxiliary && this.isCustomerPlanning) return 'À affecter';

      return this.isCustomerPlanning
        ? formatIdentity(event.auxiliary.identity, 'Fl')
        : formatIdentity(event.customer.identity, 'fL').replace(' ', '');
    },
    getDisplayedEvent (event, day, startDisplay, endDisplay) {
      const dayEvent = { ...event };
      const eventStartDate = moment(event.startDate);
      const eventEndDate = moment(event.endDate);
      let displayedStartHour = eventStartDate.hours();
      const displayedEndHour = eventEndDate.hours();
      let displayedStartMinutes = eventStartDate.minutes();
      const displayedEndMinutes = eventEndDate.minutes();
      let staffingStartHour = displayedStartHour;

      if (event.type === ABSENCE && event.absenceNature === DAILY) {
        if ([ILLNESS, WORK_ACCIDENT].includes(event.absence) && !moment(event.startDate).isSame(day, 'day')) {
          displayedStartHour = eventStartDate.startOf('d').hours();
          displayedStartMinutes = 0;
          staffingStartHour = STAFFING_VIEW_START_HOUR;
        }
      }

      const staffingBeginning = Math.max((staffingStartHour - startDisplay) * 60 + displayedStartMinutes, 0);
      const staffingEnd = Math.min(
        (displayedEndHour - startDisplay) * 60 + displayedEndMinutes,
        (endDisplay - startDisplay) * 60 + displayedEndMinutes
      );

      dayEvent.displayedStartDate = moment(day)
        .hour(displayedStartHour)
        .minutes(displayedStartMinutes)
        .toISOString();
      dayEvent.displayedEndDate = eventEndDate.toISOString();
      dayEvent.staffingBeginning = staffingBeginning;
      dayEvent.staffingDuration = staffingEnd - staffingBeginning;

      return dayEvent;
    },
  },
};
