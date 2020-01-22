import sectors from '../api/Sectors';
import { workHealthServices } from '../data/workHealthServices';
import { urssafCodes } from '../data/urssafCodes';
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
  const res = await sectors.list({ name: value });
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
  return !value || !!value.match(/^[0-1][0-9]:[0-5][0-9]$|^2[0-3]:[0-5][0-9]$/);
};

export const minDate = (min) => {
  return (value) => moment(min).isSameOrBefore(value);
};

export const apeCode = value => !value || /^\d{3,4}[A-Z]$/.test(value);

export const validWorkHealthService = value => !value || workHealthServices.map(whs => whs.value).includes(value);

export const validUrssafCode = value => !value || urssafCodes.map(code => code.value).includes(value);

export const validEstablishmentName = value => !value || !/[^a-zA-Z0-9éèêëâàäöôûüîïç°2!#$%&'()*+,\-./:;<=>?@\s]/.test(value);

export const validSiret = value => !value || /^\d{14}$/.test(value);

export const rcs = value => !value || /^[0-9]*[1-9][0-9]*$/.test(value);
