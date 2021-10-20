import { isValidIBAN, isValidBIC } from 'ibantools';
import axios from 'axios';
import { workHealthServices } from '@data/workHealthServices';
import { urssafCodes } from '@data/urssafCodes';
import { GAP_ANSWER_MAX_LENGTH } from '@data/constants';

export const frPhoneNumber = (value) => {
  if (!value) return true;

  return value.match(/^[0]{1}[1-9]{1}[.\-\s]{0,1}([0-9]{2}[.\-\s]{0,1}){4}$/) || false;
};

export const frZipCode = (value) => {
  if (!value) return false;

  return value.split(' ').join('').match(/[0-9]{5}/) || false;
};

export const iban = (value) => {
  if (!value) return false;

  return isValidIBAN(value.split(' ').join(''));
};

export const bic = (value) => {
  if (!value) return false;

  return isValidBIC(value);
};

export const frAddress = async (value) => {
  if (!value) return true;

  // interceptor avoids having an infinite loop for API calls although we don't understand how it works
  axios.interceptors.request.use();
  const res = await axios.get('https://api-adresse.data.gouv.fr/search', { params: { q: value, limit: 1 } });

  return (res.data.features.length === 1 && res.data.features[0].properties.score > 0.9);
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

export const twoFractionDigits = value => /^\d*(\.\d{0,2})?$/.test(value);

export const validHour = value => !value || !!value.match(/^[0-1][0-9]:[0-5][0-9]$|^2[0-3]:[0-5][0-9]$/);

export const minDate = min => value => !value || new Date(min) <= new Date(value);

export const maxDate = max => value => !value || new Date(max) >= new Date(value);

export const apeCode = value => !value || /^\d{3,4}[A-Z]$/.test(value);

export const validWorkHealthService = value => !value || workHealthServices.map(whs => whs.value).includes(value);

export const validUrssafCode = value => !value || urssafCodes.map(code => code.value).includes(value);

export const validSiret = value => !value || /^\d{14}$/.test(value);

export const rcs = value => !value || /^[0-9]*[1-9][0-9]*$/.test(value);

export const validYear = value => !value || /^[2]{1}[0]{1}[0-9]{2}$/.test(value);

export const validTradeName = value => !value || /^[0-9a-zA-Z]{0,11}$/.test(value);

// Quiz fill-the-gap
const parseTagCode = (str) => {
  const outerAcc = '';
  const gapAcc = [];

  return parseTagCodeRecursively(outerAcc, gapAcc, str);
};

const parseTagCodeRecursively = (outerAcc, gapAcc, str) => {
  const splitedStr = str.match(/(.*?)<trou>(.*?)<\/trou>(.*)/s);

  if (!splitedStr) return { outerAcc: outerAcc.concat(' ', str), gapAcc };

  gapAcc.push(splitedStr[2]);
  return parseTagCodeRecursively(outerAcc.concat(' ', splitedStr[1]), gapAcc, splitedStr[3]);
};

const containLonelyTag = value => /<trou>|<\/trou>/g.test(value);

export const validTagging = (value) => {
  if (!value) return true;
  const { outerAcc, gapAcc } = parseTagCode(value);

  return !containLonelyTag(outerAcc) && !gapAcc.some(v => containLonelyTag(v));
};

export const validAnswerInTag = (value) => {
  if (!value) return true;
  const { gapAcc } = parseTagCode(value);

  return !gapAcc.some(v => v.trim() !== v);
};

export const validCaracters = value => /^[a-zA-Z0-9àâçéèêëîïôûùü\040'-]*$/.test(value);

export const validCaractersTags = (value) => {
  if (!value) return true;
  const { gapAcc } = parseTagCode(value);

  return gapAcc.every(v => validCaracters(v));
};

export const validTagLength = (value) => {
  if (!value) return true;
  const { gapAcc } = parseTagCode(value);

  return gapAcc.every(v => v.length > 0 && v.length <= GAP_ANSWER_MAX_LENGTH);
};

export const validTagsCount = (value) => {
  if (!value) return true;
  const { gapAcc } = parseTagCode(value);

  return (gapAcc.length === 0 && !validTagging(value)) || gapAcc.length === 1 ||
    (gapAcc.length === 2 && validTagging(value));
};

export const minArrayLength = minLength => value => value.filter(a => !!a).length >= minLength;

export const maxArrayLength = maxLength => value => value.filter(a => !!a).length <= maxLength;

export const minTextArrayLength = minLength => value => value.filter(a => !!a.text).length >= minLength;

export const minOneCorrectAnswer = value => value.filter(a => a.correct).length >= 1;

export const urlAddress = (value) => {
  if (!value) return true;

  return value.match(/^(?:http(s)?:\/\/)[\w.-]+(?:\.[\w.-]+)+[\w\-._~:/?#[\]@!$&'()*+,;=.]+$/) || false;
};
