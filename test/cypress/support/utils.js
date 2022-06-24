const moment = require('../../../src/core/helpers/moment');

exports.applyOffset = (hours, minutes) => {
  const parisOffset = moment.tz('Europe/Paris')._offset;
  const utcOffset = moment().utcOffset();
  return `${hours + (utcOffset - parisOffset) / 60}:${minutes}`;
};
