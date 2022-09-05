import * as luxon from 'luxon';

luxon.Settings.defaultLocale = 'fr';
luxon.Settings.defaultZone = 'Europe/Paris';
luxon.Settings.throwOnInvalid = true;

export { DateTime } from 'luxon';
