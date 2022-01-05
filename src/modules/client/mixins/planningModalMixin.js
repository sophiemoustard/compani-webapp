import { mapGetters, mapState } from 'vuex';
import get from 'lodash/get';
import Gdrive from '@api/GoogleDrive';
import SelectSector from '@components/form/SelectSector';
import DateInput from '@components/form/DateInput';
import DatetimeRange from '@components/form/DatetimeRange';
import NiSelect from '@components/form/Select';
import NiInput from '@components/form/Input';
import SearchAddress from '@components/form/SearchAddress';
import FileUploader from '@components/form/FileUploader';
import {
  INTERVENTION,
  ABSENCE,
  UNAVAILABILITY,
  INTERNAL_HOUR,
  NEVER,
  EVERY_DAY,
  EVERY_WEEK_DAY,
  EVERY_WEEK,
  EVERY_TWO_WEEKS,
  ABSENCE_TYPES,
  ABSENCE_NATURES,
  UNJUSTIFIED,
  DAILY,
  HOURLY,
  ILLNESS,
  WORK_ACCIDENT,
  COACH_ROLES,
  EVENT_TYPES,
  CUSTOMER,
  UNKNOWN_AVATAR,
  DEFAULT_AVATAR,
  CANCELLATION_OPTIONS,
  CANCELLATION_REASONS,
  OTHER,
  SECTOR,
  DOC_EXTENSIONS,
  EVENT_TRANSPORT_OPTIONS,
} from '@data/constants';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import moment from '@helpers/moment';
import { isBefore } from '@helpers/date';
import PlanningModalHeader from 'src/modules/client/components/planning/PlanningModalHeader';

export const planningModalMixin = {
  components: {
    'ni-select-sector': SelectSector,
    'ni-date-input': DateInput,
    'ni-search-address': SearchAddress,
    'ni-select': NiSelect,
    'ni-input': NiInput,
    'ni-file-uploader': FileUploader,
    'ni-datetime-range': DatetimeRange,
    'ni-planning-modal-header': PlanningModalHeader,
  },
  data () {
    return {
      INTERVENTION,
      ABSENCE,
      UNAVAILABILITY,
      INTERNAL_HOUR,
      NEVER,
      ILLNESS,
      WORK_ACCIDENT,
      UNJUSTIFIED,
      DAILY,
      HOURLY,
      OTHER,
      absenceNatureOptions: ABSENCE_NATURES,
      cancellationConditions: CANCELLATION_OPTIONS,
      cancellationReasons: CANCELLATION_REASONS,
      addressError: 'Adresse non valide',
      selectedAddress: '',
      extensions: DOC_EXTENSIONS,
      eventTransportOptions: EVENT_TRANSPORT_OPTIONS,
    };
  },
  computed: {
    ...mapState('planning', ['filters']),
    ...mapGetters({
      clientRole: 'main/getClientRole',
    }),
    absenceOptions () {
      return this.newEvent && this.newEvent.absenceNature === HOURLY
        ? ABSENCE_TYPES.filter(type => type.value === UNJUSTIFIED)
        : ABSENCE_TYPES;
    },
    isCustomerPlanning () {
      return this.personKey === CUSTOMER;
    },
    eventTypeOptions () {
      if (this.isCustomerPlanning || (this.selectedAuxiliary && !this.selectedAuxiliary._id)) {
        return EVENT_TYPES.filter(type => type.value === INTERVENTION);
      }

      return EVENT_TYPES;
    },
    auxiliariesOptions () {
      if (this.isCustomerPlanning && this.creationModal) {
        return formatAndSortIdentityOptions(this.activeAuxiliaries);
      }

      const sectorId = this.newEvent ? this.newEvent.sector : this.editedEvent.sector;
      const sector = this.filters.find(f => f.type === SECTOR && f._id === sectorId);

      return [
        { label: `À affecter ${sector ? sector.label : ''}`, value: '' },
        ...formatAndSortIdentityOptions(this.activeAuxiliaries),
      ];
    },
    internalHourOptions () {
      return this.internalHours.map(hour => ({ label: hour.name, value: hour._id }));
    },
    repetitionOptions () {
      const oneWeekRepetitionLabel = this.creationModal
        ? `Tous les ${moment(this.newEvent.dates.startDate).format('dddd')}s`
        : 'Tous les lundis';
      const twoWeeksRepetitionLabel = this.creationModal
        ? `Le ${moment(this.newEvent.dates.startDate).format('dddd')} une semaine sur deux`
        : 'Le lundi une semaine sur deux';

      return [
        { label: 'Jamais', value: NEVER },
        { label: 'Tous les jours', value: EVERY_DAY },
        { label: 'Tous les jours de la semaine (lundi au vendredi)', value: EVERY_WEEK_DAY },
        { label: oneWeekRepetitionLabel, value: EVERY_WEEK },
        { label: twoWeeksRepetitionLabel, value: EVERY_TWO_WEEKS },
      ];
    },
    customerProfileRedirect () {
      return COACH_ROLES.includes(this.clientRole)
        ? { name: 'ni customers info', params: { customerId: this.selectedCustomer._id } }
        : { name: 'auxiliaries customers info', params: { customerId: this.selectedCustomer._id } };
    },
    // Event creation
    customerSubscriptionsOptions () {
      if (!this.selectedCustomer || !this.selectedCustomer.subscriptions ||
        this.selectedCustomer.subscriptions.length === 0) return [];

      return this.selectedCustomer.subscriptions.map(sub => ({
        label: get(sub, 'service.name') || '',
        value: sub._id,
        disable: get(sub, 'service.isArchived') || false,
      }));
    },
    additionalValue () {
      return !get(this.selectedAuxiliary, '_id')
        ? ''
        : `justificatif_absence_${this.selectedAuxiliary.identity.lastname}`;
    },
    docsUploadUrl () {
      const driveId = get(this.selectedAuxiliary, 'administrative.driveFolder.driveId');
      return !driveId ? '' : Gdrive.getUploadUrl(driveId);
    },
  },
  methods: {
    deleteClassFocus () {
      this.$refs.addressSelect.$el.className = this.$refs.addressSelect.$el.className.replace('q-if-focused ', '');
    },
    hasContractOnEvent (auxiliary, startDate, endDate = startDate) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;

      return auxiliary.contracts.some(contract => moment(contract.startDate).isSameOrBefore(endDate) &&
          (!contract.endDate || moment(contract.endDate).isAfter(startDate)));
    },
    customerAddressList (event) {
      const addresses = [];

      const primaryAddress = get(this.selectedCustomer, 'contact.primaryAddress', null);
      if (event.address.fullAddress && primaryAddress && primaryAddress.fullAddress === event.address.fullAddress) {
        addresses.push(this.formatAddressOptions(event.address));
      } else if (primaryAddress) {
        addresses.push(this.formatAddressOptions(primaryAddress));
      }

      const secondaryAddress = get(this.selectedCustomer, 'contact.secondaryAddress', null);
      const isCustomerSecondaryAddressDefined = secondaryAddress && secondaryAddress.fullAddress;
      if (event.address.fullAddress && secondaryAddress && secondaryAddress.fullAddress === event.address.fullAddress) {
        addresses.push(this.formatAddressOptions(event.address));
      } else if (isCustomerSecondaryAddressDefined) {
        addresses.push(this.formatAddressOptions(secondaryAddress));
      }

      const eventAddressIsNotCustomerPrimaryAddress = event.address.fullAddress && primaryAddress &&
        primaryAddress.fullAddress !== event.address.fullAddress;
      const eventAddressIsNotCustomerSecondaryAddress = isCustomerSecondaryAddressDefined &&
        secondaryAddress.fullAddress !== event.address.fullAddress;
      if (eventAddressIsNotCustomerPrimaryAddress &&
        (eventAddressIsNotCustomerSecondaryAddress || !isCustomerSecondaryAddressDefined)) {
        addresses.push(this.formatAddressOptions(event.address));
      }

      return addresses;
    },
    getAvatar (user) {
      if (!user || !user._id) return UNKNOWN_AVATAR;

      return get(user, 'picture.link') || DEFAULT_AVATAR;
    },
    formatAddressOptions (address) {
      return { label: address.fullAddress, value: address };
    },
    isDailyAbsence (event) {
      return event.type === ABSENCE && event.absenceNature === DAILY;
    },
    isHourlyAbsence (event) {
      return event.type === ABSENCE && event.absenceNature === HOURLY;
    },
    isIllnessOrWorkAccident (event) {
      return event.absence && [ILLNESS, WORK_ACCIDENT].includes(event.absence);
    },
    setDateHours (event, eventType) {
      if (this.isDailyAbsence(event)) {
        if ([WORK_ACCIDENT, ILLNESS].includes(event.absence)) {
          this.$emit(`update:${eventType}`, {
            ...event,
            dates: { ...event.dates, endDate: moment(event.dates.endDate).endOf('d').toISOString() },
          });
        } else {
          this.$emit(`update:${eventType}`, {
            ...event,
            dates: {
              startDate: moment(event.dates.startDate).startOf('d').toISOString(),
              endDate: moment(event.dates.endDate).endOf('d').toISOString(),
            },
          });
        }
      }
    },
    getCustomersOptions (startDate) {
      if (this.customers.length === 0) return [];

      const activeCustomers = this.customers
        .filter(customer => !customer.archivedAt &&
          (!customer.stoppedAt || !startDate || isBefore(startDate, customer.stoppedAt)));
      if (!get(this.selectedAuxiliary, '_id')) return formatAndSortIdentityOptions(activeCustomers); // Unassigned event

      if (!get(this.selectedAuxiliary, 'contracts')) return [];

      return formatAndSortIdentityOptions(activeCustomers);
    },
  },
};
