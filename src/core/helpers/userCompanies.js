import compact from 'lodash/compact';
import get from 'lodash/get';
import uniqBy from 'lodash/uniqBy';
import has from 'lodash/has';
import CompaniDate from '@helpers/dates/companiDates';

export const getCurrentAndFutureCompanies = (userCompanyList) => {
  const currentAndFutureCompanies = compact(userCompanyList
    .filter(uc => !uc.endDate || CompaniDate().isBefore(uc.endDate))
    .map(uc => uc.company));

  return uniqBy(currentAndFutureCompanies, company => (has(company, '_id') ? company._id : company));
};

export const hasUserAccessToCompany = (loggedUser, company) => {
  const loggedUserCompany = get(loggedUser, 'company._id') || '';
  const holdingCompanies = get(loggedUser, 'holding.companies') || [];

  return loggedUserCompany === company || holdingCompanies.includes(company);
};
