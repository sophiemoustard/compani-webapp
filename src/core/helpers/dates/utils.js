import CompaniDate from './companiDates';
import CompaniDuration from './companiDurations';

export const ascendingSort = (a, b) => (CompaniDate(a).isAfter(b) ? 1 : -1);

export const ascendingSortBy = key => (a, b) => (CompaniDate(a[key]).isAfter(b[key]) ? 1 : -1);

export const descendingSortBy = key => (a, b) => (CompaniDate(a[key]).isBefore(b[key]) ? 1 : -1);

export const getISOTotalDuration = timePeriods => timePeriods
  .reduce((acc, tp) => acc.add(CompaniDate(tp.endDate).diff(tp.startDate, 'seconds')), CompaniDuration())
  .toISO();
