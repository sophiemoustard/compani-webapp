import get from 'lodash/get';
import moment from '@helpers/moment';

import { CIVILITY_OPTIONS, NATURE_OPTIONS } from '@data/constants';
import nationalities from '@data/nationalities';
import { getMonthlyHours } from '@helpers/utils';
import { formatDate } from '@helpers/date';

export const getContractTags = (data) => {
  const monthlyHours = getMonthlyHours(data.contract);
  const civility = CIVILITY_OPTIONS.find(opt => opt.value === data.user.identity.title);
  return {
    auxiliaryTitle: civility ? civility.label : '',
    auxiliaryFirstname: data.user.identity.firstname,
    auxiliaryLastname: data.user.identity.lastname,
    auxiliaryAddress: data.user.contact.address.fullAddress,
    auxiliaryCity: data.user.contact.address.street,
    auxiliaryZipCode: data.user.contact.address.zipCode,
    auxiliaryBirthCountry: data.user.identity.birthCountry,
    auxiliaryBirthState: data.user.identity.birthState,
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
    initialContractMonthlyHours: data.initialContractMonthlyHours,
  };
};

export const getCustomerDocumentTags = data => ({
  customerFirstname: data.customer.identity.firstname,
  customerLastname: data.customer.identity.lastname,
  customerAddress: data.customer.contact.primaryAddress.fullAddress,
  customerStreet: data.customer.contact.primaryAddress.street,
  customerCity: data.customer.contact.primaryAddress.city,
  customerZipCode: data.customer.contact.primaryAddress.zipCode,
  ics: get(data, 'company.ics'),
  companyName: data.company.name,
  companyAddress: data.company.address.fullAddress,
  companyStreet: data.company.address.street,
  companyCity: data.company.address.city,
  companyZipCode: data.company.address.zipCode,
  downloadDate: formatDate(Date.now()),
  rcs: get(data, 'company.rcs'),
});

export const getMandateTags = (data, doc) => {
  const customerDocumentTags = getCustomerDocumentTags(data);

  return {
    ...customerDocumentTags,
    bankAccountOwner: data.customer.payment.bankAccountOwner || '',
    bic: data.customer.payment.bic || '',
    iban: data.customer.payment.iban || '',
    rum: doc.rum,
  };
};
const formatNumber = number => parseFloat(Math.round(number * 100) / 100).toFixed(2);

export const getSubscriptionQuoteTags = data => ({
  serviceName: data.service.name,
  unitTTCRate: data.unitTTCRate,
  estimatedWeeklyVolume: data.estimatedWeeklyVolume,
  sundays: data.sundays,
  evenings: data.evenings,
});

export const getQuoteTags = (data, doc) => {
  const customerDocumentTags = getCustomerDocumentTags(data);
  const subscriptions = doc.subscriptions.map(subscription => ({
    serviceName: subscription.serviceName,
    sundays: subscription.sundays ? subscription.sundays : '',
    evenings: subscription.evenings ? subscription.evenings : '',
    weeklyVolume: subscription.estimatedWeeklyVolume,
    serviceNature: subscription.nature ? NATURE_OPTIONS.find(nat => nat.value === subscription.nature).label : '',
    weeklyRate: subscription.estimatedWeeklyRate ? `${formatNumber(subscription.estimatedWeeklyRate)}€` : '',
    unitTTCRate: subscription.unitTTCRate ? `${formatNumber(subscription.unitTTCRate)}€` : '',
  }));

  return {
    ...customerDocumentTags,
    quoteNumber: doc.quoteNumber,
    subscriptions,
  };
};
