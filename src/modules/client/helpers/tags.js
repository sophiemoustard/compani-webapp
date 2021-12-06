import get from 'lodash/get';
import { CIVILITY_OPTIONS, NATURE_OPTIONS, WEEKS_PER_MONTH } from '@data/constants';
import nationalities from '@data/nationalities';
import { formatPrice } from '@helpers/utils';
import { formatDate } from '@helpers/date';

const getMonthlyHours = contract => Number.parseFloat(contract.weeklyHours * WEEKS_PER_MONTH).toFixed(1);

export const getContractTags = (data) => {
  const monthlyHours = getMonthlyHours(data.version);
  const civility = CIVILITY_OPTIONS.find(opt => opt.value === get(data, 'user.identity.title'));

  return {
    auxiliaryTitle: civility ? civility.label : '',
    auxiliaryFirstname: get(data, 'user.identity.firstname') || '',
    auxiliaryLastname: get(data, 'user.identity.lastname') || '',
    auxiliaryAddress: get(data, 'user.contact.address.fullAddress') || '',
    auxiliaryStreet: get(data, 'user.contact.address.street') || '',
    auxiliaryCity: get(data, 'user.contact.address.city') || '',
    auxiliaryZipCode: get(data, 'user.contact.address.zipCode') || '',
    auxiliaryBirthCountry: get(data, 'user.identity.birthCountry') || '',
    auxiliaryBirthState: get(data, 'user.identity.birthState') || '',
    auxiliaryBirthDate: get(data, 'user.identity.birthDate') ? formatDate(data.user.identity.birthDate) : '',
    auxiliaryNationality: get(data, 'user.identity.nationality') ? nationalities[data.user.identity.nationality] : '',
    auxiliarySSN: get(data, 'user.identity.socialSecurityNumber') || '',
    grossHourlyRate: get(data, 'version.grossHourlyRate') || '',
    monthlyHours,
    salary: get(data, 'version.grossHourlyRate') ? monthlyHours * data.version.grossHourlyRate : '',
    startDate: get(data, 'version.startDate') ? formatDate(data.version.startDate) : '',
    weeklyHours: get(data, 'version.weeklyHours') || '',
    yearlyHours: get(data, 'version.weeklyHours') ? data.version.weeklyHours * 52 : '',
    uploadDate: formatDate(Date.now()),
    initialContractStartDate: get(data, 'contract.startDate') ? formatDate(data.contract.startDate) : '',
    initialContractMonthlyHours: get(data, 'contract.versions[0]') ? getMonthlyHours(data.contract.versions[0]) : '',
    companySIRET: get(data, 'user.establishment.siret') || '',
    auxiliaryBirthCity: get(data, 'user.identity.birthCity') || '',
  };
};

export const getCustomerDocumentTags = (data) => {
  const civility = CIVILITY_OPTIONS.find(opt => opt.value === get(data, 'customer.identity.title'));

  return {
    customerTitle: civility ? civility.label : '',
    customerFirstname: get(data, 'customer.identity.firstname') || '',
    customerLastname: get(data, 'customer.identity.lastname') || '',
    customerAddress: get(data, 'customer.contact.primaryAddress.fullAddress') || '',
    customerStreet: get(data, 'customer.contact.primaryAddress.street') || '',
    customerCity: get(data, 'customer.contact.primaryAddress.city') || '',
    customerZipCode: get(data, 'customer.contact.primaryAddress.zipCode') || '',
    ics: get(data, 'company.ics') || '',
    companyName: get(data, 'company.name') || '',
    companyAddress: get(data, 'company.address.fullAddress') || '',
    companyStreet: get(data, 'company.address.street') || '',
    companyCity: get(data, 'company.address.city') || '',
    companyZipCode: get(data, 'company.address.zipCode') || '',
    downloadDate: formatDate(Date.now()),
    rcs: get(data, 'company.rcs') || '',
  };
};

export const getMandateTags = (customer, company, mandate) => ({
  ...getCustomerDocumentTags({ customer, company }),
  bankAccountOwner: get(customer, 'payment.bankAccountOwner') || '',
  bic: get(customer, 'payment.bic') || '',
  iban: get(customer, 'payment.iban') || '',
  rum: mandate.rum,
});

export const getSubscriptionQuoteTags = data => ({
  service: {
    name: get(data, 'service.name'),
    nature: get(data, 'service.nature'),
    ...(get(data, 'service.surcharge.evening') || get(data, 'service.surcharge.sunday')) && {
      surcharge: {
        ...get(data, 'service.surcharge.evening') && { evening: data.service.surcharge.evening },
        ...get(data, 'service.surcharge.sunday') && { sunday: data.service.surcharge.sunday },
      },
    },
  },
  unitTTCRate: data.unitTTCRate,
  estimatedWeeklyVolume: data.estimatedWeeklyVolume,
  ...data.sundays && { sundays: data.sundays },
  ...data.evenings && { evenings: data.evenings },
});

export const getQuoteTags = (customer, company, quote) => ({
  ...getCustomerDocumentTags({ customer, company }),
  quoteNumber: quote.quoteNumber,
  subscriptions: quote.subscriptions.map(subscription => ({
    serviceName: subscription.service.name,
    sundays: subscription.sundays ? subscription.sundays : '',
    evenings: subscription.evenings ? subscription.evenings : '',
    weeklyVolume: subscription.estimatedWeeklyVolume,
    serviceNature: subscription.service.nature
      ? NATURE_OPTIONS.find(nat => nat.value === subscription.service.nature).label
      : '',
    weeklyRate: subscription.estimatedWeeklyRate ? formatPrice(subscription.estimatedWeeklyRate) : '',
    unitTTCRate: subscription.unitTTCRate ? formatPrice(subscription.unitTTCRate) : '',
  })),
});
