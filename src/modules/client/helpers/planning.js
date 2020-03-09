export const getPaidTransport = (transportDuration, timeBetween) =>
  (timeBetween > transportDuration + 15 || timeBetween < transportDuration) ? transportDuration : timeBetween;
