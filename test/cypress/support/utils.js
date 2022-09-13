const { DateTime } = require('../../../src/core/helpers/dates/luxon');

exports.applyOffset = (hours, minutes) => {
  const utcOffset = DateTime.now().offset;

  return `${hours + utcOffset / 60}:${minutes}`;
};
