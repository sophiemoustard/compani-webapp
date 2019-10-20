import moment from 'moment';
import { getLastVersion } from '../helpers/utils';
import { MONTHLY, FIXED, ONCE, HOURLY, NATURE_OPTIONS, WEEKS_PER_MONTH } from '../data/constants';

export const subscriptionMixin = {
  data () {
    return {
      subscriptions: [],
      selectedSubscription: {},
      subscriptionHistoryModal: false,
      subscriptionsColumns: [
        {
          name: 'service',
          label: 'Service',
          align: 'left',
          field: row => row.service.name,
        },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          format: (value) => {
            const nature = NATURE_OPTIONS.find(option => option.value === value);
            return nature ? this.$_.capitalize(nature.label) : '';
          },
          field: row => row.service.nature,
        },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire TTC',
          align: 'center',
          field: row => row.unitTTCRate && `${this.formatNumber(row.unitTTCRate)}€`,
        },
        {
          name: 'estimatedWeeklyVolume',
          label: 'Volume hebdomadaire estimatif',
          align: 'center',
          field: row => row.service.nature === HOURLY ? row.estimatedWeeklyVolume && `${row.estimatedWeeklyVolume}h` : row.estimatedWeeklyVolume,
        },
        {
          name: 'weeklyRate',
          label: 'Coût hebdomadaire TTC *',
          align: 'center',
          field: row => `${this.formatNumber(this.computeWeeklyRate(row, this.getMatchingFunding(row)))}€`,
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: '_id',
        },
      ],
      subscriptionHistoryColumns: [
        {
          name: 'createdAt',
          label: 'Date de modification',
          align: 'left',
          field: 'createdAt',
          format: value => moment(value).format('DD/MM/YYYY'),
        },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire TTC',
          align: 'center',
          field: row => `${this.formatNumber(row.unitTTCRate)}€`,
        },
        {
          name: 'estimatedWeeklyVolume',
          label: 'Volume hebdomadaire estimatif',
          align: 'center',
          field: row => this.selectedSubscription.service && this.selectedSubscription.service.nature === HOURLY
            ? `${row.estimatedWeeklyVolume}h` : row.estimatedWeeklyVolume,
        },
        {
          name: 'evenings',
          label: 'dont soirées',
          align: 'center',
          field: row => row.evenings ? `${row.evenings}h` : '',
        },
        {
          name: 'sundays',
          label: 'dont dimanche',
          align: 'center',
          field: row => row.sundays ? `${row.sundays}h` : '',
        },
      ],
      paginationHistory: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
    };
  },
  methods: {
    formatNumber (number) {
      return parseFloat(Math.round(number * 100) / 100).toFixed(2)
    },
    computeWeeklyRate (subscription, funding) {
      let weeklyRate = subscription.unitTTCRate * subscription.estimatedWeeklyVolume;
      if (subscription.service.surcharge) {
        if (subscription.sundays && subscription.service.surcharge.sunday) {
          weeklyRate += subscription.sundays * subscription.unitTTCRate * subscription.service.surcharge.sunday / 100;
        }
        if (subscription.evenings && subscription.service.surcharge.evening) {
          weeklyRate += subscription.evenings * subscription.unitTTCRate * subscription.service.surcharge.evening / 100;
        }
      }
      let fundingReduction = 0;
      if (this.isCompleteFunding(funding)) {
        if (funding.frequency !== ONCE) {
          if (funding.nature === FIXED) {
            fundingReduction = funding.frequency === MONTHLY ? funding.amountTTC / WEEKS_PER_MONTH : funding.amountTTC;
          } else {
            const refundedHours = Math.min(
              funding.frequency === MONTHLY ? funding.careHours / WEEKS_PER_MONTH : funding.careHours,
              subscription.estimatedWeeklyVolume
            );
            fundingReduction = refundedHours * funding.unitTTCRate;
          }

          fundingReduction = fundingReduction * (1 - funding.customerParticipationRate / 100);
        }
      }

      return Math.max(weeklyRate - fundingReduction, 0);
    },
    isCompleteFunding (funding) {
      if (!funding || funding === {}) return false;
      if (!(funding.frequency && funding.nature && funding.customerParticipationRate)) return false;
      if (funding.nature === FIXED && !funding.amountTTC) return false;
      if (funding.nature === HOURLY && (!funding.unitTTCRate || !funding.careHours)) return false;
      return true;
    },
    getMatchingFunding (subscription) {
      return this.fundings.find(fd => fd.subscription === subscription._id &&
        (fd.endDate ? this.$moment().isBetween(fd.startDate, fd.endDate) : this.$moment().isSameOrAfter(fd.startDate))
      );
    },
    showHistory (id) {
      this.selectedSubscription = this.subscriptions.find(sub => sub._id === id);
      this.subscriptionHistoryModal = true;
    },
    resetSubscriptionHistoryData () {
      this.subscriptionHistoryModal = false;
      this.selectedSubscription = [];
    },
    refreshSubscriptions () {
      try {
        const { subscriptions } = this.customer;
        this.subscriptions = subscriptions ? subscriptions.map(sub => ({
          ...getLastVersion(sub.versions, 'createdAt'),
          ...sub,
        })) : [];
      } catch (e) {
        console.error(e);
      }
    },
  },
};
