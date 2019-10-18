import moment from 'moment';

export const extend = (...sources) => {
  const extended = {};
  let deep = false;
  let i = 0;

  // Check if a deep merge
  if (typeof (sources[0]) === 'boolean') {
    deep = sources[0];
    i++;
  }

  // Merge the object into the extended object
  const merge = (obj) => {
    for (const prop in obj) {
      if (obj.hasOwnProperty(prop)) {
        if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
          // If we're doing a deep merge and the property is an object
          extended[prop] = extend(true, extended[prop], obj[prop]);
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
    if (obj.hasOwnProperty(prop)) {
      if (Object.prototype.toString.call(obj[prop]) === '[object Object]') {
        cleared[prop] = clear(obj[prop]);
      } else {
        cleared[prop] = '';
      }
    }
  }
  return cleared;
};

export const getLastVersion = (versions, dateKey) => {
  if (versions.length === 0) return null;
  if (versions.length === 1) return {...versions[0]};

  return [...versions].sort((a, b) => new Date(b[dateKey]) - new Date(a[dateKey]))[0];
};

export const roundFrenchNumber = number => number.toLocaleString('fr-FR', { minimumFractionDigits: 2, style: 'currency', currency: 'EUR', currencyDisplay: 'symbol' });

export const formatPrice = (val) => {
  return val ? roundFrenchNumber(val) : roundFrenchNumber(0);
};

export const formatIdentity = (identity, format) => {
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

export const formatHours = (value, digits = 2) => {
  if (!value) return '0,00h';
  return `${parseFloat(value).toFixed(digits).replace('.', ',')}h`
};

export const formatHoursWithMinutes = (date) => {
  return `${moment(date).hours()}h${moment(date).format('mm')}`;
};

export const formatPhone = phoneNumber => phoneNumber
  ? phoneNumber.replace(/^(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/, '$1 $2 $3 $4 $5')
  : '';
