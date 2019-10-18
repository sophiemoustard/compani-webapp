import moment from 'moment';
import _ from 'lodash'

export const getUserStartDate = (contracts) => {
  if (!contracts || !_.isArray(contracts) || contracts.length === 0) return 'N/A'
  const startDates = contracts.map(contract => moment(contract.startDate, 'DD/MM/YYYY'));
  return moment.min(startDates).format('DD/MM/YYYY');
};
