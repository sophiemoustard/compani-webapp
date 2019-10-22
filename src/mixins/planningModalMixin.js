import SelectSector from '../components/form/SelectSector';
import DatetimePicker from '../components/form/DatetimePicker.vue';
import DatetimeRange from '../components/form/DatetimeRange.vue';
import NiSelect from '../components/form/Select';
import NiInput from '../components/form/Input';
import SearchAddress from '../components/form/SearchAddress';
import FileUploader from '../components/form/FileUploader';
import PlanningModalHeader from '../components/planning/PlanningModalHeader';
import { formatIdentity } from '../helpers/utils';
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
  ADMIN,
  COACH,
  EVENT_TYPES,
  CUSTOMER,
  UNKNOWN_AVATAR,
  DEFAULT_AVATAR,
  CANCELLATION_OPTIONS,
  CANCELLATION_REASONS,
  OTHER,
} from '../data/constants';

export const planningModalMixin = {
  components: {
    'ni-select-sector': SelectSector,
    'ni-datetime-picker': DatetimePicker,
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
    mainUser () {
      return this.$store.getters['main/user'];
    },
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
            !this.newEvent.absenceNature || !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
        case INTERVENTION:
          return (this.isCustomerPlanning && !this.newEvent.auxiliary) || !this.newEvent.customer ||
            !this.newEvent.subscription || !this.newEvent.dates.startDate ||
            !this.newEvent.dates.endDate || !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
        case INTERNAL_HOUR:
          return !this.newEvent.auxiliary || !this.newEvent.dates.startDate || !this.newEvent.dates.endDate ||
            !this.newEvent.internalHour || !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
        case UNAVAILABILITY:
        default:
          return !this.newEvent.auxiliary || !this.newEvent.dates.startDate || !this.newEvent.dates.endDate ||
            !this.newEvent.dates.startHour || !this.newEvent.dates.endHour;
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
            !this.editedEvent.absenceNature || !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
        case INTERVENTION:
          const shouldDisableButton = (this.isCustomerPlanning && !this.editedEvent.sector) ||
            !this.editedEvent.subscription || !this.editedEvent.dates.startDate ||
            !this.editedEvent.dates.endDate || !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
          if (this.editedEvent.isCancelled) {
            return shouldDisableButton || !this.editedEvent.cancel.condition || !this.editedEvent.cancel.reason ||
              !this.editedEvent.misc;
          } else return shouldDisableButton;
        case INTERNAL_HOUR:
          return !this.editedEvent.auxiliary || !this.editedEvent.dates.startDate || !this.editedEvent.dates.endDate ||
            !this.editedEvent.internalHour || !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
        case UNAVAILABILITY:
        default:
          return !this.editedEvent.auxiliary || !this.editedEvent.dates.startDate || !this.editedEvent.dates.endDate ||
            !this.editedEvent.dates.startHour || !this.editedEvent.dates.endHour;
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

      return [
        { label: 'À affecter', value: '' },
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
      return this.mainUser.role.name === COACH || this.mainUser.role.name === ADMIN
        ? { name: 'customers profile', params: { id: this.selectedCustomer._id } }
        : { name: 'profile customers info', params: { customerId: this.selectedCustomer._id } };
    },
    // Event creation
    customerSubscriptionsOptions () {
      if (!this.selectedCustomer || !this.selectedCustomer.subscriptions ||
        this.selectedCustomer.subscriptions.length === 0) return [];

      let subscriptions = this.selectedCustomer.subscriptions;
      if (this.selectedAuxiliary._id) {
        if (!this.selectedAuxiliary.hasCustomerContractOnEvent) subscriptions = subscriptions.filter(sub => sub.service.type !== CUSTOMER_CONTRACT);
        if (!this.selectedAuxiliary.hasCompanyContractOnEvent) subscriptions = subscriptions.filter(sub => sub.service.type !== COMPANY_CONTRACT);
      }
      return subscriptions.map(sub => ({ label: sub.service.name, value: sub._id }));
    },
    additionalValue () {
      return !this.selectedAuxiliary._id ? '' : `justificatif_absence_${this.selectedAuxiliary.identity.lastname}`;
    },
    docsUploadUrl () {
      const driveId = this.$_.get(this.selectedAuxiliary, 'administrative.driveFolder.driveId');
      return !driveId ? '' : this.$gdrive.getUploadUrl(driveId);
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
    iconSelect (event) {
      if (this.customerAddressList(event).length === 1) return [];

      return [{ icon: 'swap_vert', class: 'select-icon pink-icon', handler: () => { this.toggleAddressSelect() } }];
    },
    customerAddressList (event) {
      const addresses = [];

      const primaryAddress = this.$_.get(this.selectedCustomer, 'contact.primaryAddress', null);
      if (event.address.fullAddress && primaryAddress && primaryAddress.fullAddress === event.address.fullAddress) {
        addresses.push(this.formatAddressOptions(event.address));
      } else if (primaryAddress) {
        addresses.push(this.formatAddressOptions(primaryAddress));
      }

      const secondaryAddress = this.$_.get(this.selectedCustomer, 'contact.secondaryAddress', null);
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

      return this.$_.get(user, 'picture.link') || DEFAULT_AVATAR;
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
    toggleAddressSelect () {
      return this.$refs['addressSelect'].show();
    },
  },
};
