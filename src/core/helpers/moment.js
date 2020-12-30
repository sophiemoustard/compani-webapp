import moment from 'moment-business-days';
import { extendMoment } from 'moment-range';
import Holidays from 'date-holidays';

moment.locale('fr');
const momentRange = extendMoment(moment);
const holidays = new Holidays('FR');
const now = new Date();
const currentYear = now.getFullYear();
const currentHolidays = [
  ...holidays.getHolidays(currentYear),
  ...holidays.getHolidays(currentYear + 1),
  ...holidays.getHolidays(currentYear - 1),
];
moment.updateLocale('fr', {
  holidays: currentHolidays.map(holiday => holiday.date),
  holidayFormat: 'YYYY-MM-DD HH:mm:ss',
  workingWeekdays: [1, 2, 3, 4, 5, 6],
});

export default momentRange;
