export const dateDiff = (firstDate, secondDate) => {
  const durationInMilliseconds = new Date(firstDate) - new Date(secondDate);
  return parseInt(Math.ceil(durationInMilliseconds / 1000 / 60 / 60 / 24), 10);
};
