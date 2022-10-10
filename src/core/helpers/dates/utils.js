import CompaniDate from './companiDates';

export const ascendingSort = (a, b) => (CompaniDate(a).isAfter(b) ? 1 : -1);

export const ascendingSortBy = key => (a, b) => (CompaniDate(a[key]).isAfter(b[key]) ? 1 : -1);

export const descendingSortBy = key => (a, b) => (CompaniDate(a[key]).isBefore(b[key]) ? 1 : -1);
