export const dateDiff = (firstDate, secondDate) => {
  const durationInMilliseconds = new Date(firstDate) - new Date(secondDate);

  return parseInt(Math.floor(durationInMilliseconds / 1000 / 60 / 60 / 24), 10);
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
