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
  const absoluteDuration = CompaniDuration(durationISO).abs();

  if (absoluteDuration.isShorterThan('PT1H')) {
    const minutes = Math.floor(absoluteDuration.asMinutes());

    return formatQuantity('minute', minutes);
  }
  if (absoluteDuration.isShorterThan('P1D')) {
    const hours = Math.floor(absoluteDuration.asHours());

    return formatQuantity('heure', hours);
  }
  if (absoluteDuration.isShorterThan('P1M')) {
    const days = Math.floor(absoluteDuration.asDays());

    return formatQuantity('jour', days);
  }
  if (absoluteDuration.isShorterThan('P1Y')) {
    const months = Math.floor(absoluteDuration.asMonths());

    return `${months} mois`;
  }
  const years = Math.floor(absoluteDuration.asYears());

  return formatQuantity('an', years);
};
