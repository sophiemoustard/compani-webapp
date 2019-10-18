import sectors from '../api/Sectors';
const ibantools = require('ibantools');
const axios = require('axios');
const moment = require('moment');

export const frPhoneNumber = (value) => {
  if (!value) return true;

  return value.match(/^[0]{1}[1-9]{1}[0-9]{8}$/) || false;
};

export const frZipCode = (value) => {
  if (!value) return false;

  return value.split(' ').join('').match(/[0-9]{5}/) || false;
};

export const iban = (value) => {
  if (!value) return false;

  return ibantools.isValidIBAN(value.split(' ').join(''));
};

export const bic = (value) => {
  if (!value) return false;

  return ibantools.isValidBIC(value);
};

export const posDecimals = (value) => {
  return value ? parseFloat(value) >= 0 : false;
};

export const frAddress = async (value) => {
  if (!value) return true;
  const res = await axios.get('https://api-adresse.data.gouv.fr/search', {
    params: {
      q: value,
      limit: 1,
    },
  });
  return new Promise(resolve => {
    resolve(res.data.features.length === 1 && res.data.features[0].properties.score > 0.9);
  });
};

export const sector = async (value) => {
  if (!value) return true;
  const res = await sectors.showAll({ name: value });
  return new Promise(resolve => {
    resolve(res.length === 0);
  });
};

export const positiveNumber = (value) => {
  if (!value) return true;
  if (isNaN(parseFloat(value)) || !isFinite(value)) return false;

  return value >= 0;
};

export const strictPositiveNumber = (value) => {
  if (!value && value !== 0) return true;
  if (isNaN(parseFloat(value)) || !isFinite(value)) return false;

  return value > 0;
};

export const validHour = (value) => {
  return !!value.match(/^[0-1][0-9]:[0-5][0-9]$|^2[0-2]:[0-5][0-9]$/);
};

export const minDate = (min) => {
  return (value) => moment(min).isSameOrBefore(value);
};
