import { formatQuantity } from '@helpers/utils';

export const dateDiff = (newerDate, olderDate) => new Date(newerDate) - new Date(olderDate);

export const formatDateDiff = (durationInMilliseconds) => {
  const absoluteDuration = Math.abs(durationInMilliseconds);

  if (absoluteDuration < 1000 * 60 * 60 * 24) {
    const hours = parseInt(Math.floor(absoluteDuration / 1000 / 60 / 60), 10);

    return `${durationInMilliseconds < 0 ? 'dans ' : ''}${formatQuantity('heure', hours)}`;
  }
  if (absoluteDuration < 1000 * 60 * 60 * 24 * 30) {
    const days = parseInt(Math.floor(absoluteDuration / 1000 / 60 / 60 / 24), 10);

    return `${durationInMilliseconds < 0 ? 'dans ' : ''}${formatQuantity('jour', days)}`;
  }
  if (absoluteDuration < 1000 * 60 * 60 * 24 * 365) {
    const months = parseInt(Math.floor(absoluteDuration / 1000 / 60 / 60 / 24 / 30), 10);

    return `${durationInMilliseconds < 0 ? 'dans ' : ''}${months} mois`;
  }

  const years = parseInt(Math.floor(absoluteDuration / 1000 / 60 / 60 / 24 / 365), 10);

  return `${durationInMilliseconds < 0 ? 'dans ' : ''}${formatQuantity('an', years)}`;
};

export const isBetween = (date, min, max) => new Date(date) < new Date(max) && new Date(date) > new Date(min);

export const getStartOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const getEndOfDay = date => new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

export const ascendingSort = (a, b) => new Date(a) - new Date(b);

export const descendingSort = (a, b) => new Date(b) - new Date(a);

export const formatDate = (value) => {
  if (!value) return '';

  const date = new Date(value).getDate() < 10 ? `0${new Date(value).getDate()}` : new Date(value).getDate();
  const month = new Date(value).getMonth() + 1;
  const formattedMonth = month < 10 ? `0${month}` : month;

  return `${date}/${formattedMonth}/${new Date(value).getFullYear()}`;
};
