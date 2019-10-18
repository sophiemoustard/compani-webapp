import { Notify } from 'quasar';

export const NotifyPositive = (detail) => Notify.create({
  color: 'positive',
  icon: 'thumb up',
  detail,
  position: 'bottom-left',
  timeout: 2500,
});

export const NotifyWarning = (detail) => Notify.create({
  color: 'warning',
  icon: 'warning',
  detail,
  position: 'bottom-left',
  timeout: 2500,
});

export const NotifyNegative = (detail) => Notify.create({
  color: 'negative',
  icon: 'warning',
  detail,
  position: 'bottom-left',
  timeout: 2500,
});
