import { Notify } from 'quasar';

export const NotifyPositive = message => Notify.create({
  color: 'green-600',
  icon: 'thumb_up',
  message,
  position: 'bottom-left',
  timeout: 2500,
});

export const NotifyWarning = message => Notify.create({
  color: 'warning',
  icon: 'warning',
  message,
  position: 'bottom-left',
  timeout: 2500,
});

export const NotifyNegative = message => Notify.create({
  color: 'negative',
  icon: 'warning',
  message,
  position: 'bottom-left',
  timeout: 2500,
});
