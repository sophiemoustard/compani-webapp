import moment from '@helpers/moment';

export const getUserStartDate = (contracts) => {
  if (!contracts || !Array.isArray(contracts) || contracts.length === 0) return 'N/A';
  const startDates = contracts.map(contract => moment(contract.startDate, 'DD/MM/YYYY'));
  return moment.min(startDates).format('DD/MM/YYYY');
};
