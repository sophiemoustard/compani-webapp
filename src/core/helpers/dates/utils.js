import { HH_MM } from '@data/constants';
import { formatQuantity } from '../utils';
import CompaniDate from './companiDates';
import CompaniDuration from './companiDurations';

export const ascendingSort = (a, b) => (CompaniDate(a).isAfter(b) ? 1 : -1);

export const ascendingSortBy = key => (a, b) => (CompaniDate(a[key]).isAfter(b[key]) ? 1 : -1);

export const descendingSortBy = key => (a, b) => (CompaniDate(a[key]).isBefore(b[key]) ? 1 : -1);

export const getISODuration = timePeriod => CompaniDate(timePeriod.endDate).diff(timePeriod.startDate, 'seconds');

export const getISOTotalDuration = timePeriods => timePeriods
  .reduce((acc, tp) => acc.add(getISODuration(tp)), CompaniDuration())
  .toISO();

export const getRoundedDiffInDays = (date, otherDate) => Math
  .round(CompaniDuration(CompaniDate(date).diff(CompaniDate(otherDate), 'days')).asDays());

export const formatIntervalHourly = slot => `${CompaniDate(slot.startDate).format(HH_MM)} - `
  + `${CompaniDate(slot.endDate).format(HH_MM)}`;

export const formatISODurationWithBestUnit = (durationISO) => {
  const durationAbs = CompaniDuration(durationISO).abs();

  if (durationAbs.isShorterThan('PT1H')) {
    const minutes = Math.floor(durationAbs.asMinutes());

    return formatQuantity('minute', minutes);
  }
  if (durationAbs.isShorterThan('P1D')) {
    const hours = Math.floor(durationAbs.asHours());

    return formatQuantity('heure', hours);
  }
  if (durationAbs.isShorterThan('P1M')) {
    const days = Math.floor(durationAbs.asDays());

    return formatQuantity('jour', days);
  }
  if (durationAbs.isShorterThan('P1Y')) {
    const months = Math.floor(durationAbs.asMonths());

    return `${months} mois`;
  }
  const years = Math.floor(durationAbs.asYears());

  return formatQuantity('an', years);
};
