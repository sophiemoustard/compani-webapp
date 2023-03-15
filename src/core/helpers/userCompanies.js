import compact from 'lodash/compact';
import uniqBy from 'lodash/uniqBy';
import has from 'lodash/has';
import CompaniDate from '@helpers/dates/companiDates';

export const getCurrentAndFutureCompanies = (userCompanyList) => {
  const currentAndFutureCompanies = compact(userCompanyList
    .filter(uc => !uc.endDate || CompaniDate().isBefore(uc.endDate))
    .map(uc => uc.company));

  const getCompanyId = company => (has(company, '_id') ? company._id : company);
  return uniqBy(currentAndFutureCompanies, getCompanyId);
};
