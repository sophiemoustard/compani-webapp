import compact from 'lodash/compact';
import CompaniDate from '@helpers/dates/companiDates';

export const getCurrentOrFutureCompanies = userCompanyList => compact(
  userCompanyList.filter(uc => !uc.endDate || CompaniDate().isBefore(uc.endDate)).map(uc => uc.company)
);
