import { ref, computed } from 'vue';
import useVuelidate from '@vuelidate/core';
import { required, requiredIf } from '@vuelidate/validators';
import get from 'lodash/get';
import {
  INTERNAL_HOUR,
  ABSENCE,
  INTERVENTION,
  ILLNESS,
  DAILY,
  CUSTOMER,
  WORK_ACCIDENT,
  OTHER,
  NEVER,
} from '@data/constants';
import { frAddress, maxDate, positiveNumber, minDate, validHour, strictMinHour } from '@helpers/vuelidateCustomVal';
import moment from '@helpers/moment';

export const usePlanningAction = (personKey, customers) => {
  const newEvent = ref({
    type: INTERVENTION,
    dates: { startDate: '', endDate: '', startHour: '', endHour: '' },
    auxiliary: null,
    customer: null,
    subscription: null,
    internalHour: null,
    absence: null,
    absenceNature: null,
    extension: null,
    address: { zipCode: '', street: '', city: '', fullAddress: '' },
    repetition: { frequency: NEVER },
    attachment: { driveId: '', link: '' },
    misc: '',
  });
  const editedEvent = ref({});
  const editedCustomerAbsence = ref({ dates: { startDate: '', endDate: '' }, absenceType: '' });

  const rules = computed(() => ({
    newEvent: {
      type: { required },
      dates: {
        startDate: {
          required,
          maxDate: getCustomerStoppedDate(newEvent.value) ? maxDate(getCustomerStoppedDate(newEvent.value)) : '',
        },
        endDate: {
          required: requiredIf(newEvent.value.type !== ABSENCE || get(newEvent.value, 'absenceNature') === DAILY),
          ...(!!get(newEvent.value, 'dates.startDate') && { minDate: minDate(newEvent.value.dates.startDate) }),
          ...(!!get(newEvent.value, 'dates.startDate') && get(newEvent.value, 'type') !== ABSENCE && {
            maxDate: maxDate(moment(newEvent.value.dates.startDate).endOf('d').toISOString()),
          }),
        },
        startHour: { required, validHour },
        endHour: { required, validHour, strictMinHour: strictMinHour(get(newEvent.value, 'dates.startHour')) },
      },
      auxiliary: {
        required: requiredIf(newEvent.value.type !== INTERVENTION || personKey === CUSTOMER),
      },
      customer: { required: requiredIf(newEvent.value.type === INTERVENTION) },
      subscription: { required: requiredIf(newEvent.value.type === INTERVENTION) },
      internalHour: { required: requiredIf(newEvent.value.type === INTERNAL_HOUR) },
      absence: { required: requiredIf(newEvent.value.type === ABSENCE) },
      absenceNature: { required: requiredIf(newEvent.value.type === ABSENCE) },
      extension: {
        required: requiredIf(newEvent.value.type === ABSENCE && get(newEvent.value, 'isExtendedAbsence')),
      },
      address: {
        zipCode: { required: requiredIf(!!get(newEvent.value, 'address.fullAddress')) },
        street: { required: requiredIf(!!get(newEvent.value, 'address.fullAddress')) },
        city: { required: requiredIf(!!get(newEvent.value, 'address.fullAddress')) },
        fullAddress: newEvent.value.type === INTERNAL_HOUR ? { frAddress } : {},
      },
      repetition: {
        frequency: { required: requiredIf(newEvent.value.type !== ABSENCE) },
      },
      attachment: {
        driveId: {
          required: requiredIf(newEvent.value.type === ABSENCE &&
            [ILLNESS, WORK_ACCIDENT].includes(get(newEvent.value, 'absence'))),
        },
        link: {
          required: requiredIf(newEvent.value.type === ABSENCE &&
          [ILLNESS, WORK_ACCIDENT].includes(get(newEvent.value, 'absence'))),
        },
      },
      misc: {
        required: requiredIf(newEvent.value.type === ABSENCE && get(newEvent.value, 'absence') === OTHER),
      },
    },
    editedEvent: {
      dates: {
        startDate: {
          required,
          maxDate: getCustomerStoppedDate(editedEvent.value) ? maxDate(getCustomerStoppedDate(editedEvent.value)) : '',
        },
        endDate: {
          required,
          ...(!!get(editedEvent.value, 'dates.startDate') && { minDate: minDate(editedEvent.value.dates.startDate) }),
          ...(!!get(editedEvent.value, 'dates.startDate') && get(editedEvent.value, 'type') !== ABSENCE && {
            maxDate: maxDate(moment(editedEvent.value.dates.startDate).endOf('d').toISOString()),
          }),
        },
        startHour: { required, validHour },
        endHour: { required, validHour, strictMinHour: strictMinHour(get(editedEvent.value, 'dates.startHour')) },
      },
      auxiliary: { required: requiredIf(editedEvent.value.type !== INTERVENTION) },
      sector: { required: requiredIf(!editedEvent.value.auxiliary) },
      customer: { required: requiredIf(editedEvent.value.type === INTERVENTION) },
      subscription: { required: requiredIf(editedEvent.value.type === INTERVENTION) },
      internalHour: { required: requiredIf(editedEvent.value.type === INTERNAL_HOUR) },
      absence: { required: requiredIf(editedEvent.value.type === ABSENCE) },
      absenceNature: { required: requiredIf(editedEvent.value.type === ABSENCE) },
      address: {
        zipCode: { required: requiredIf(!!get(editedEvent.value, 'address.fullAddress')) },
        street: { required: requiredIf(!!get(editedEvent.value, 'address.fullAddress')) },
        city: { required: requiredIf(!!get(editedEvent.value, 'address.fullAddress')) },
        fullAddress: editedEvent.value.type === INTERNAL_HOUR ? { frAddress } : {},
      },
      attachment: {
        driveId: {
          required: requiredIf(editedEvent.value.type === ABSENCE &&
            [ILLNESS, WORK_ACCIDENT].includes(editedEvent.value.absence)),
        },
        link: {
          required: requiredIf(editedEvent.value.type === ABSENCE &&
            [ILLNESS, WORK_ACCIDENT].includes(editedEvent.value.absence)),
        },
      },
      cancel: {
        condition: { required: requiredIf(editedEvent.value.type === INTERVENTION && editedEvent.value.isCancelled) },
        reason: { required: requiredIf(editedEvent.value.type === INTERVENTION && editedEvent.value.isCancelled) },
      },
      misc: {
        required: requiredIf((editedEvent.value.type === ABSENCE && editedEvent.value.absence === OTHER) ||
          editedEvent.value.isCancelled),
      },
      kmDuringEvent: { positiveNumber },
    },
    editedCustomerAbsence: {
      absenceType: { required },
      dates: {
        startDate: { required },
        endDate: {
          required,
          minDate: minDate(get(editedCustomerAbsence.value, 'dates.startDate')),
        },
      },
    },
  }));

  const getCustomerStoppedDate = (event) => {
    const customer = customers.value ? customers.value.find(c => c._id === event.customer) : null;
    return get(customer, 'stoppedAt') || '';
  };

  const eventValidation = useVuelidate(rules, { newEvent, editedEvent, editedCustomerAbsence });

  return {
    // Data
    newEvent,
    editedEvent,
    editedCustomerAbsence,
    // Computed
    eventValidation,
  };
};
