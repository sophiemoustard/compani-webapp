import transform from 'lodash/transform';
import isObject from 'lodash/isObject';
import get from 'lodash/get';
import diacriticsMap from '@data/diacritics';
import { descendingSort } from '@helpers/date';

export const extend = (...sources) => {
  const extended = {};
  const deep = sources[0];
  let i = 0;

  // Merge the object into the extended object
  const merge = (obj) => {
    for (const prop in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, prop)) {
        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          // If we're doing a deep merge and the property is an object
          extended[prop] = extend(extended[prop], obj[prop]);
        } else {
          // Otherwise, do a regular merge
          extended[prop] = obj[prop];
        }
      }
    }
  };

  for (; i < sources.length; i++) {
    merge(sources[i]);
  }

  return extended;
};

export const clear = (obj) => {
  const cleared = {};

  for (const prop in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, prop)) {
      if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
        cleared[prop] = clear(obj[prop]);
      } else {
        cleared[prop] = '';
      }
    }
  }
  return cleared;
};

export const removeEmptyProps = obj => transform(obj, (acc, value, key) => {
  if (!value) return;
  acc[key] = isObject(value) ? removeEmptyProps(value) : value;
});

export const getLastVersion = (versions, dateKey) => {
  if (versions.length === 0) return null;
  if (versions.length === 1) return { ...versions[0] };

  return [...versions].sort((a, b) => descendingSort(a[dateKey], b[dateKey]))[0];
};

export const getLastDocument = (docs) => {
  if (!docs || !Array.isArray(docs) || docs.length === 0) return [];
  const sortedDocs = docs.sort((a, b) => descendingSort(a.createdAt, a.createdAt));
  return [sortedDocs[0]];
};

export const roundFrenchPrice = number => number.toLocaleString(
  'fr-FR',
  { minimumFractionDigits: 2, style: 'currency', currency: 'EUR', currencyDisplay: 'symbol' }
);

export const roundFrenchPercentage = (number, digits = 2) => (number
  ? (number / 100).toLocaleString('fr-FR', { minimumFractionDigits: digits, style: 'percent' })
  : '0%'
);

export const formatPrice = val => (val ? roundFrenchPrice(val) : roundFrenchPrice(0));

export const formatStringToPrice = (str) => {
  const slicedStr = str.slice(0, 6);

  return formatPrice(parseFloat(slicedStr));
};

export const formatPriceWithSign = value => (value >= 0 ? `+${formatPrice(value)}` : formatPrice(value));

export const formatIdentity = (identity, format) => {
  if (!identity) return '';

  const formatLower = format.toLowerCase();
  const values = [];

  for (let i = 0; i < format.length; ++i) {
    let value;
    if (formatLower[i] === 'f') value = (identity.firstname || '').trim();
    else if (formatLower[i] === 'l') value = (identity.lastname || '').trim().toUpperCase();

    if (!value) continue;

    if (formatLower[i] === format[i]) value = `${value.charAt(0).toUpperCase()}.`;
    values.push(value);
  }

  return values.join(' ');
};

export const formatPhone = phoneNumber => (phoneNumber
  ? phoneNumber.replace(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5')
  : '');

export const formatPhoneForPayload = phoneNumber => (phoneNumber
  ? phoneNumber.replace(/[\s\-.]/g, '')
  : '');

// eslint-disable-next-line no-control-regex
export const removeDiacritics = str => str.replace(/[^\u0000-\u007E]/g, a => diacriticsMap[a] || a);

export const upperCaseFirstLetter = str => str.charAt(0).toUpperCase() + str.slice(1);

export const truncate = (string, limit = 30) => (string.length > limit ? `${string.slice(0, limit)}...` : string);

export const formatQuantity = (itemLabel, quantity) => {
  if (quantity > 1) itemLabel = itemLabel.split(' ').map(word => `${word}s`).join(' ');

  return `${quantity} ${itemLabel}`;
};

export const sortStrings = (a, b) => a.toLowerCase().localeCompare(b.toLowerCase());

export const formatAndSortOptions = (array, field) => array
  .map(element => ({ label: get(element, field), value: element._id }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const formatAndSortIdentityOptions = (array, field = null) => array
  .map(element => ({
    label: formatIdentity(get(element, field ? `${field}.identity` : 'identity'), 'FL'),
    value: get(element, field ? `${field}._id` : '_id'),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export const formatNumberForCSV = number => parseFloat(number).toFixed(2).replace('.', ',');

export const readAPIResponseWithTypeArrayBuffer = (response) => {
  const dataView = new DataView(response.data);
  const decoder = new TextDecoder('utf8');
  const decodedResponse = JSON.parse(decoder.decode(dataView));

  return decodedResponse;
};

export const getBillingItemsPrice = service => service.billingItems
  .reduce((acc, bi) => (acc += bi.defaultUnitAmount), 0);

export const getBillingItemsName = (service) => {
  if (!get(service, 'billingItems.length')) return [];

  const billingItemsName = service.billingItems.reduce((acc, bi) => (acc += `${bi.name}, `), '');
  return [billingItemsName.slice(0, -2)];
};

export const formatDownloadName = name => name.replaceAll(/ - | |'/g, '_');

export const toCents = value => parseFloat(value).toFixed(2) * 100;

export const toEuros = value => value / 100;
