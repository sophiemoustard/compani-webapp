import { Hh, HhMM, Mmin, HhMMmin } from '@data/constants';
import { Duration } from './luxon';

const CompaniDurationFactory = (inputDuration) => {
  const _duration = inputDuration;

  return {
    // GETTER
    get _getDuration () {
      return _duration;
    },

    // DISPLAY
    format (template) {
      const shiftedDuration = _duration.shiftTo('hours', 'minutes', 'seconds');
      const minutes = shiftedDuration.get('minutes');
      const hours = shiftedDuration.get('hours');

      if (template === HhMM) {
        if (minutes === 0) return _duration.toFormat(Hh);

        return _duration.toFormat(HhMM);
      } if (template === HhMMmin) {
        if (hours === 0) return _duration.toFormat(Mmin);
        if (minutes === 0) return _duration.toFormat(Hh);

        return _duration.toFormat(HhMMmin);
      }
      throw Error('Invalid argument: expected specific format');
    },

    toISO () {
      return _duration.toISO();
    },

    // MANIPULATE
    add (miscTypeOtherDuration) {
      const otherDuration = _formatMiscToCompaniDuration(miscTypeOtherDuration);

      return CompaniDurationFactory(_duration.plus(otherDuration));
    },
  };
};

const _formatMiscToCompaniDuration = (...args) => {
  if (args.length === 0) return Duration.fromISO('PT0S');

  if (args.length === 1) {
    if (typeof args[0] === 'string') return Duration.fromISO(args[0]);

    if (args[0] instanceof Object) {
      if (args[0]._getDuration && args[0]._getDuration instanceof Duration) return args[0]._getDuration;
    }
  }
  return Duration.invalid('wrong arguments');
};

export default (...args) => CompaniDurationFactory(_formatMiscToCompaniDuration(...args));
