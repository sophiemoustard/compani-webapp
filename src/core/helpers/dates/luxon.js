import * as luxon from 'luxon';

luxon.Settings.defaultLocale = 'fr';
luxon.Settings.throwOnInvalid = true;

export { DateTime, Duration } from 'luxon';
