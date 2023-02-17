import compact from 'lodash/compact';
import uniqBy from 'lodash/uniqBy';
import CompaniDate from '@helpers/dates/companiDates';

export const getCurrentAndFutureCompanies = (userCompanyList) => {
  const currentAndFutureCompanies = compact(userCompanyList
    .filter(uc => !uc.endDate || CompaniDate().isBefore(uc.endDate))
    .map(uc => uc.company));

  return uniqBy(currentAndFutureCompanies, '_id');
};
