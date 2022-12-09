import { DateTime, Duration, Interval } from './luxon';

const CompaniIntervalFactory = (inputInterval) => {
  const _interval = inputInterval;

  return ({
    get _getInterval () {
      return _interval;
    },

    rangeBy (durationISO) {
      const luxonDurationStep = Duration.fromISO(durationISO);
      if (luxonDurationStep.toMillis() === 0) throw new Error('invalid argument : duration is zero');

      const fragmentedIntervals = _interval.splitBy(luxonDurationStep);
      const dates = fragmentedIntervals.map(fi => fi.start.toUTC().toISO());

      const lastFragment = fragmentedIntervals[fragmentedIntervals.length - 1];
      const lastFragmentEqualsDurationStep = lastFragment.start.plus(luxonDurationStep).equals(lastFragment.end);
      if (lastFragmentEqualsDurationStep) dates.push(_interval.end.toUTC().toISO());

      return dates;
    },
  });
};

const isCompaniInterval = arg => arg instanceof Object && arg._getInterval && arg._getInterval instanceof Interval;

const _formatMiscToCompaniInterval = (...args) => {
  if (args.length === 1) {
    if (isCompaniInterval(args[0])) return args[0]._getInterval;
  }
  if (args.length === 2) {
    if (typeof args[0] === 'string' && typeof args[1] === 'string') {
      const luxonDate1 = DateTime.fromISO(args[0]);
      const luxonDate2 = DateTime.fromISO(args[1]);
      return Interval.fromDateTimes(luxonDate1, luxonDate2);
    }
  }

  return Interval.invalid('wrong arguments');
};

export default (...args) => CompaniIntervalFactory(_formatMiscToCompaniInterval(...args));
