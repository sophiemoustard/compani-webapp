export const dateDiff = (firstDate, secondDate) => {
  const durationInMilliseconds = new Date(firstDate) - new Date(secondDate);

  return parseInt(Math.floor(durationInMilliseconds / 1000 / 60 / 60 / 24), 10);
};

export const isBetween = (date, min, max) => new Date(date) < new Date(max) && new Date(date) > new Date(min);
