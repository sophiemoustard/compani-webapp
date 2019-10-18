import moment from 'moment';

import { COMPANY_CONTRACT, WEEKS_PER_MONTH, CIVILITY_OPTIONS } from '../data/constants';
import nationalities from '../data/nationalities';

export const generateContractFields = (type, data) => {
  if (type === COMPANY_CONTRACT) {
    const monthlyHours = Number.parseFloat(data.contract.weeklyHours * WEEKS_PER_MONTH).toFixed(1);
    const civility = CIVILITY_OPTIONS.find(opt => opt.value === data.user.identity.title);

    return {
      auxiliaryTitle: civility ? civility.label : '',
      auxiliaryFirstname: data.user.identity.firstname,
      auxiliaryLastname: data.user.identity.lastname,
      auxiliaryAddress: data.user.contact.address.fullAddress,
      auxiliaryBirthDate: moment(data.user.identity.birthDate).format('DD/MM/YYYY'),
      auxiliaryNationality: nationalities[data.user.identity.nationality],
      auxiliarySSN: data.user.identity.socialSecurityNumber,
      grossHourlyRate: data.contract.grossHourlyRate,
      monthlyHours,
      salary: monthlyHours * data.contract.grossHourlyRate,
      startDate: moment(data.contract.startDate).format('DD/MM/YYYY'),
      weeklyHours: data.contract.weeklyHours,
      yearlyHours: data.contract.weeklyHours * 52,
      uploadDate: moment().format('DD/MM/YYYY'),
      initialContractStartDate: moment(data.initialContractStartDate).format('DD/MM/YYYY'),
    };
  }
  return {
    test: 'test',
  }
}
