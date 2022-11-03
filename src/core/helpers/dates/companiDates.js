import pick from 'lodash/pick';
import { DateTime, Duration } from './luxon';

const CompaniDateFactory = (inputDate) => {
  const _date = inputDate;

  return ({
    // GETTER
    get _getDate () {
      return _date;
    },

    getUnits (units) {
      return pick(_date.toObject(), units);
    },

    weekday () {
      return _date.weekday - 1;
      /*  fox luxon:  1 = Monday, 2 = Tuesday, ... 7 = Sunday
          for us:     0 = Monday, 1 = Tuesday, ... 6 = Sunday. cf constants.js */
    },

    // DISPLAY
    format (fmt) {
      return _date.toFormat(fmt);
    },

    toDate () {
      return _date.toUTC().toJSDate();
    },

    toISO () {
      return _date.toUTC().toISO();
    },

    toLocalISO () {
      return _date.toLocal().toISO();
    },

    // QUERY
    isBefore (miscTypeOtherDate, unit = 'millisecond') {
      const otherDate = _formatMiscToCompaniDate(miscTypeOtherDate);

      return _date.startOf(unit) < otherDate.startOf(unit);
    },

    isAfter (miscTypeOtherDate, unit = 'millisecond') {
      const otherDate = _formatMiscToCompaniDate(miscTypeOtherDate);

      return _date.startOf(unit) > otherDate.startOf(unit);
    },

    isSame (miscTypeOtherDate, unit = 'millisecond') {
      const otherDate = _formatMiscToCompaniDate(miscTypeOtherDate);

      return _date.hasSame(otherDate, unit);
    },

    isSameOrBefore (miscTypeOtherDate, unit = 'millisecond') {
      const otherDate = _formatMiscToCompaniDate(miscTypeOtherDate);

      return (_date.hasSame(otherDate, unit) || _date.startOf(unit) < otherDate.startOf(unit));
    },

    isSameOrAfter (miscTypeOtherDate, unit = 'millisecond') {
      const otherDate = _formatMiscToCompaniDate(miscTypeOtherDate);

      return (_date.hasSame(otherDate, unit) || _date.startOf(unit) > otherDate.startOf(unit));
    },

    isSameOrBetween (miscTypeFirstDate, miscTypeSecondDate, unit = 'millisecond') {
      const firstDate = _formatMiscToCompaniDate(miscTypeFirstDate);
      const secondDate = _formatMiscToCompaniDate(miscTypeSecondDate);

      return (_date.hasSame(firstDate, unit) || _date.hasSame(secondDate, unit) ||
        (_date.startOf(unit) > firstDate.startOf(unit) && _date.startOf(unit) < secondDate.startOf(unit)));
    },

    // MANIPULATE
    startOf (unit) {
      return CompaniDateFactory(_date.startOf(unit));
    },

    endOf (unit) {
      return CompaniDateFactory(_date.endOf(unit));
    },

    diff (miscTypeOtherDate, unit) {
      if (typeof unit !== 'string') throw Error('Invalid argument: expected unit to be a string');

      const otherDate = _formatMiscToCompaniDate(miscTypeOtherDate);
      const diffInSecondAndInputUnit = _date.diff(otherDate, [unit, 'seconds']);

      return diffInSecondAndInputUnit.toISO();
    },

    add (amount) {
      const isoDuration = Duration.fromISO(amount);
      return CompaniDateFactory(_date.plus(isoDuration));
    },

    set (values) {
      return CompaniDateFactory(_date.set(values));
    },
  });
};

const _formatMiscToCompaniDate = (...args) => {
  if (!args.length) return DateTime.now();

  if (args.length === 1) {
    if (args[0] instanceof Object && args[0]._getDate && args[0]._getDate instanceof DateTime) {
      return args[0]._getDate;
    }
    if (args[0] instanceof Date) return DateTime.fromJSDate(args[0]);
    if (typeof args[0] === 'string' && args[0] !== '') return DateTime.fromISO(args[0]);
  }

  if (args.length === 2 && typeof args[0] === 'string' && typeof args[1] === 'string') {
    const options = args[0].endsWith('Z') ? { zone: 'utc' } : {};
    return DateTime.fromFormat(args[0], args[1], options);
  }

  return DateTime.invalid('wrong arguments');
};

export default (...args) => CompaniDateFactory(_formatMiscToCompaniDate(...args));
