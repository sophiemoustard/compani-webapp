const moment = require('../../../src/core/helpers/moment');

const currentFranceOffset = 2;
exports.applyOffset = (hours, minutes) => {
  const utcOffset = moment().utcOffset();
  return `${hours + utcOffset / 60 - currentFranceOffset}:${minutes}`;
};
