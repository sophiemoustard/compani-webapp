const moment = require('../../../src/core/helpers/moment');

exports.applyOffset = (hours, minutes) => {
  const utcOffset = moment().utcOffset();
  return `${hours + utcOffset / 60}:${minutes}`;
};
