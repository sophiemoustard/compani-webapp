import get from 'lodash/get';
import { CIVILITY_OPTIONS, NATURE_OPTIONS } from '@data/constants';
import { formatPrice, getBillingItemsName, getBillingItemsPrice } from '@helpers/utils';
import { formatDate } from '@helpers/date';

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

export const getTagsToGenerateQuote = data => ({
  service: {
    name: get(data, 'service.name'),
    nature: get(data, 'service.nature'),
    ...(get(data, 'service.surcharge.evening') || get(data, 'service.surcharge.sunday') ||
      get(data, 'service.surcharge.saturdays')) && {
      surcharge: {
        ...get(data, 'service.surcharge.evening') && { evening: data.service.surcharge.evening },
        ...get(data, 'service.surcharge.sunday') && { sunday: data.service.surcharge.sunday },
        ...get(data, 'service.surcharge.saturdays') && { saturdays: data.service.surcharge.saturdays },
      },
    },
  },
  unitTTCRate: data.unitTTCRate,
  billingItemsTTCRate: getBillingItemsPrice(data.service),
  serviceBillingItems: getBillingItemsName(data.service),
  weeklyCount: data.weeklyCount,
  weeklyHours: data.weeklyHours,
  ...data.saturdays && { saturdays: data.saturdays },
  ...data.sundays && { sundays: data.sundays },
  ...data.evenings && { evenings: data.evenings },
});

export const getTagsToDownloadQuote = (customer, company, quote) => ({
  ...getCustomerDocumentTags({ customer, company }),
  quoteNumber: quote.quoteNumber,
  subscriptions: quote.subscriptions.map(subscription => ({
    serviceName: subscription.service.name,
    sundays: subscription.sundays || '',
    saturdays: subscription.saturdays || '',
    evenings: subscription.evenings || '',
    weeklyVolume: subscription.weeklyCount || '',
    weeklyHours: subscription.weeklyHours || '',
    serviceNature: subscription.service.nature
      ? NATURE_OPTIONS.find(nat => nat.value === subscription.service.nature).label
      : '',
    weeklyRate: subscription.estimatedWeeklyRate ? formatPrice(subscription.estimatedWeeklyRate) : '',
    unitTTCRate: subscription.unitTTCRate ? formatPrice(subscription.unitTTCRate) : '',
    billingItemsTTCRate: subscription.billingItemsTTCRate ? formatPrice(subscription.billingItemsTTCRate) : '',
    serviceBillingItems: subscription.serviceBillingItems || '',
  })),
});
