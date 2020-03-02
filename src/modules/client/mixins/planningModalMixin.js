import { mapGetters } from 'vuex';
import get from 'lodash/get';
import Gdrive from '@api/GoogleDrive';
import SelectSector from '@components/form/SelectSector';
import DateInput from '@components/form/DateInput.vue';
import DatetimeRange from '@components/form/DatetimeRange.vue';
import NiSelect from '@components/form/Select';
import NiInput from '@components/form/Input';
import SearchAddress from '@components/form/SearchAddress';
import FileUploader from '@components/form/FileUploader';
import { formatIdentity } from '@helpers/utils';
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
  CUSTOMER_CONTRACT,
  COMPANY_CONTRACT,
  COACH_ROLES,
  EVENT_TYPES,
  CUSTOMER,
  UNKNOWN_AVATAR,
  DEFAULT_AVATAR,
  CANCELLATION_OPTIONS,
  CANCELLATION_REASONS,
  OTHER,
  SECTOR,
} from '@data/constants';
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
    };
  },
  computed: {
    ...mapGetters({
      currentUser: 'current/user',
      filters: 'planning/getFilters',
    }),
    absenceOptions () {
      if (this.newEvent && this.newEvent.absenceNature === HOURLY) {
        return ABSENCE_TYPES.filter(type => type.value === UNJUSTIFIED);
      }

      return ABSENCE_TYPES;
    },
    isCustomerPlanning () {
      return this.personKey === CUSTOMER;
    },
    disableCreationButton () {
      if (!this.newEvent.type) return true;
      switch (this.newEvent.type) {
        case ABSENCE:
          if (this.newEvent.absenceNature === DAILY) {
            return !this.newEvent.auxiliary || !this.newEvent.absence || !this.newEvent.dates.startDate ||
              !this.newEvent.dates.endDate || !this.newEvent.absenceNature ||
              (this.newEvent.absence === OTHER && !this.newEvent.misc) ||
              ([WORK_ACCIDENT, ILLNESS].includes(this.newEvent.absence) && !this.newEvent.attachment.link);
          }

          return !this.newEvent.auxiliary || !this.newEvent.absence || !this.newEvent.dates.startDate ||
            !this.newEvent.absenceNature;
        case INTERVENTION:
          return (this.isCustomerPlanning && !this.newEvent.auxiliary) || !this.newEvent.customer ||
            !this.newEvent.subscription || !this.newEvent.dates.startDate || !this.newEvent.dates.endDate;
        case INTERNAL_HOUR:
          return !this.newEvent.auxiliary || !this.newEvent.dates.startDate || !this.newEvent.dates.endDate ||
            !this.newEvent.internalHour;
        case UNAVAILABILITY:
        default:
          return !this.newEvent.auxiliary || !this.newEvent.dates.startDate || !this.newEvent.dates.endDate;
      }
    },
    disableEditionButton () {
      switch (this.editedEvent.type) {
        case ABSENCE:
          if (this.editedEvent.absenceNature === DAILY) {
            return !this.editedEvent.auxiliary || !this.editedEvent.absence || !this.editedEvent.dates.startDate ||
              !this.editedEvent.dates.endDate || !this.editedEvent.absenceNature ||
              (this.editedEvent.absence === OTHER && !this.editedEvent.misc) ||
              ([WORK_ACCIDENT, ILLNESS].includes(this.editedEvent.absence) && !this.editedEvent.attachment.link);
          }

          return !this.editedEvent.auxiliary || !this.editedEvent.absence || !this.editedEvent.dates.startDate ||
            !this.editedEvent.absenceNature;
        case INTERVENTION:
          const shouldDisableButton = !this.editedEvent.subscription || !this.editedEvent.dates.startDate ||
            !this.editedEvent.dates.endDate;
          if (this.editedEvent.isCancelled) {
            return shouldDisableButton || !this.editedEvent.cancel.condition || !this.editedEvent.cancel.reason ||
              !this.editedEvent.misc;
          } else return shouldDisableButton;
        case INTERNAL_HOUR:
          return !this.editedEvent.auxiliary || !this.editedEvent.dates.startDate || !this.editedEvent.dates.endDate ||
            !this.editedEvent.internalHour;
        case UNAVAILABILITY:
        default:
          return !this.editedEvent.auxiliary || !this.editedEvent.dates.startDate || !this.editedEvent.dates.endDate;
      }
    },
    eventTypeOptions () {
      if (this.isCustomerPlanning || (this.selectedAuxiliary && !this.selectedAuxiliary._id)) {
        return EVENT_TYPES.filter(type => type.value === INTERVENTION);
      }

      if (this.selectedAuxiliary && !this.selectedAuxiliary.hasCompanyContractOnEvent) {
        return EVENT_TYPES.filter(type => type.value !== INTERNAL_HOUR);
      }

      return EVENT_TYPES;
    },
    auxiliariesOptions () {
      if (this.isCustomerPlanning && this.creationModal) {
        return this.activeAuxiliaries.map(aux => this.formatPersonOptions(aux));
      }

      const sectorId = this.newEvent ? this.newEvent.sector : this.editedEvent.sector;
      const sector = this.filters.find(f => f.type === SECTOR && f._id === sectorId);

      return [
        { label: `À affecter ${sector ? sector.label : ''}`, value: '' },
        ...this.activeAuxiliaries.map(aux => this.formatPersonOptions(aux)),
      ];
    },
    customersOptions () {
      if (this.customers.length === 0) return [];
      if (!this.selectedAuxiliary || !this.selectedAuxiliary._id) return this.customers.map(cus => this.formatPersonOptions(cus)); // Unassigned event
      if (!this.selectedAuxiliary.contracts) return [];

      let customers = this.customers;
      if (this.selectedAuxiliary && !this.selectedAuxiliary.hasCompanyContractOnEvent) {
        const auxiliaryCustomers = [];
        for (const contract of this.selectedAuxiliary.contracts) {
          if (contract.customer && !auxiliaryCustomers.includes(contract.customer)) auxiliaryCustomers.push(contract.customer);
        }

        customers = this.customers.filter(cus => auxiliaryCustomers.includes(cus._id));
      }

      return customers.map(cus => this.formatPersonOptions(cus));
    },
    internalHourOptions () {
      return this.internalHours.map(hour => ({
        label: hour.name,
        value: hour._id,
      }));
    },
    repetitionOptions () {
      const oneWeekRepetitionLabel = this.creationModal
        ? `Tous les ${this.$moment(this.newEvent.dates.startDate).format('dddd')}s`
        : 'Tous les lundis';
      const twoWeeksRepetitionLabel = this.creationModal
        ? `Le ${this.$moment(this.newEvent.dates.startDate).format('dddd')} une semaine sur deux`
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
      return COACH_ROLES.includes(get(this, 'currentUser.role.client.name', null))
        ? { name: 'customers profile', params: { id: this.selectedCustomer._id } }
        : { name: 'profile customers info', params: { customerId: this.selectedCustomer._id } };
    },
    // Event creation
    customerSubscriptionsOptions () {
      if (!this.selectedCustomer || !this.selectedCustomer.subscriptions ||
        this.selectedCustomer.subscriptions.length === 0) return [];

      let subscriptions = this.selectedCustomer.subscriptions;
      if (this.selectedAuxiliary._id) {
        if (!this.selectedAuxiliary.hasCustomerContractOnEvent) {
          subscriptions = subscriptions.filter(sub => get(sub, 'service.type') !== CUSTOMER_CONTRACT);
        }
        if (!this.selectedAuxiliary.hasCompanyContractOnEvent) {
          subscriptions = subscriptions.filter(sub => get(sub, 'service.type') !== COMPANY_CONTRACT);
        }
      }

      return subscriptions.map(sub => ({ label: get(sub, 'service.name'), value: sub._id }));
    },
    additionalValue () {
      return !this.selectedAuxiliary._id ? '' : `justificatif_absence_${this.selectedAuxiliary.identity.lastname}`;
    },
    docsUploadUrl () {
      const driveId = get(this.selectedAuxiliary, 'administrative.driveFolder.driveId');
      return !driveId ? '' : Gdrive.getUploadUrl(driveId);
    },
  },
  methods: {
    deleteClassFocus () {
      this.$refs['addressSelect'].$el.className = this.$refs['addressSelect'].$el.className.replace('q-if-focused ', '');
    },
    hasCustomerContractOnEvent (auxiliary, startDate, endDate = startDate) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;
      if (!auxiliary.contracts.some(contract => contract.status === CUSTOMER_CONTRACT)) return false;

      const customerContracts = auxiliary.contracts.filter(contract => contract.status === CUSTOMER_CONTRACT);

      return customerContracts.some(contract => {
        return this.$moment(contract.startDate).isSameOrBefore(endDate) &&
          (!contract.endDate || this.$moment(contract.endDate).isSameOrAfter(startDate));
      });
    },
    hasCompanyContractOnEvent (auxiliary, startDate, endDate = startDate) {
      if (!auxiliary.contracts || auxiliary.contracts.length === 0) return false;
      if (!auxiliary.contracts.some(contract => contract.status === COMPANY_CONTRACT)) return false;

      const companyContracts = auxiliary.contracts.filter(contract => contract.status === COMPANY_CONTRACT);

      return companyContracts.some(contract => {
        return this.$moment(contract.startDate).isSameOrBefore(endDate) &&
          (!contract.endDate || this.$moment(contract.endDate).isAfter(startDate));
      });
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
    formatPersonOptions (person) {
      return {
        label: formatIdentity(person.identity, 'FL'),
        value: person._id,
      };
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
            dates: { ...event.dates, endDate: this.$moment(event.dates.endDate).endOf('d').toISOString() },
          });
        } else {
          this.$emit(`update:${eventType}`, {
            ...event,
            dates: {
              startDate: this.$moment(event.dates.startDate).startOf('d').toISOString(),
              endDate: this.$moment(event.dates.endDate).endOf('d').toISOString(),
            },
          });
        }
      }
    },
  },
};
