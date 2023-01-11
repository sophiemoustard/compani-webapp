import compact from 'lodash/compact';
import CompaniDate from '@helpers/dates/companiDates';

export const hasActiveOrFutureCompany = (userCompanyList, company) => {
  const companies = compact(
    userCompanyList.filter(uc => !uc.endDate || CompaniDate().isBefore(uc.endDate)).map(uc => uc.company)
  );

  return company ? companies.includes(company) : !!companies.length;
};
