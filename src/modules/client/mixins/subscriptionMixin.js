import get from 'lodash/get';
import has from 'lodash/has';
import capitalize from 'lodash/capitalize';
import { MONTHLY, FIXED, HOURLY, NATURE_OPTIONS, WEEKS_PER_MONTH } from '@data/constants';
import { getLastVersion } from '@helpers/utils';
import moment from '@helpers/moment';

export const subscriptionMixin = {
  data () {
    return {
      subscriptions: [],
      selectedSubscription: {},
      subscriptionHistoryModal: false,
      subscriptionsColumns: [
        { name: 'service', label: 'Service', align: 'left', field: row => get(row, 'service.name') },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          format: (value) => {
            const nature = NATURE_OPTIONS.find(option => option.value === value);
            return nature ? capitalize(nature.label) : '';
          },
          field: row => get(row, 'service.nature'),
        },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire TTC',
          align: 'center',
          field: row => row.unitTTCRate && `${this.formatNumber(row.unitTTCRate)}€`,
        },
        {
          name: 'weeklyHours',
          label: 'Volume horaire hebdomadaire estimatif',
          align: 'center',
          field: row => (row.weeklyHours ? `${row.weeklyHours}h` : ''),
        },
        {
          name: 'weeklyCount',
          label: 'Nombre d\'interventions hebdomadaire estimatif',
          align: 'center',
          field: row => (row.weeklyCount || ''),
        },
        {
          name: 'weeklyRate',
          label: 'Coût hebdomadaire TTC *',
          align: 'center',
          field: row => `${this.formatNumber(this.computeWeeklyRate(row, this.getMatchingFunding(row)))}€`,
        },
        { name: 'actions', label: '', align: 'left', field: '_id' },
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
          name: 'weeklyVolume',
          label: 'Volume hebdomadaire estimatif',
          align: 'center',
          field: row => (row.weeklyHours ? `${row.weeklyHours}h` : row.weeklyCount),
        },
        {
          name: 'evenings',
          label: 'dont soirées',
          align: 'center',
          field: row => (row.evenings ? `${row.evenings}h` : ''),
        },
        {
          name: 'sundays',
          label: 'dont dimanche',
          align: 'center',
          field: row => (row.sundays ? `${row.sundays}h` : ''),
        },
      ],
      paginationHistory: { rowsPerPage: 0, sortBy: 'createdAt', descending: true },
      subscriptionsLoading: false,
    };
  },
  methods: {
    formatNumber (number) {
      return parseFloat(Math.round(number * 100) / 100).toFixed(2);
    },
    computeWeeklyRate (subscription, funding) {
      let weeklyRate = subscription.weeklyHours
        ? subscription.unitTTCRate * subscription.weeklyHours
        : subscription.unitTTCRate * subscription.weeklyCount;

      if (get(subscription, 'service.surcharge')) {
        if (subscription.saturdays && subscription.service.surcharge.saturday) {
          weeklyRate += subscription.saturdays * subscription.unitTTCRate * subscription.service.surcharge.saturday
            / 100;
        }
        if (subscription.sundays && subscription.service.surcharge.sunday) {
          weeklyRate += subscription.sundays * subscription.unitTTCRate * subscription.service.surcharge.sunday / 100;
        }
        if (subscription.evenings && subscription.service.surcharge.evening) {
          weeklyRate += subscription.evenings * subscription.unitTTCRate * subscription.service.surcharge.evening / 100;
        }
      }

      if (get(subscription, 'service.billingItems.length')) {
        const totalBillingItemsAmount = subscription.service.billingItems
          .reduce((acc, bi) => (acc += bi.defaultUnitAmount), 0);
        weeklyRate += totalBillingItemsAmount * subscription.weeklyCount;
      }

      let fundingReduction = 0;
      if (this.isCompleteFunding(funding) && funding.frequency === MONTHLY) {
        if (funding.nature === FIXED) {
          fundingReduction = funding.amountTTC / WEEKS_PER_MONTH;
        }
        if (funding.nature === HOURLY) {
          const refundedHours = Math.min(funding.careHours / WEEKS_PER_MONTH, subscription.weeklyHours);
          fundingReduction = refundedHours * funding.unitTTCRate;
        }

        fundingReduction *= (1 - funding.customerParticipationRate / 100);
      }

      return Math.max(weeklyRate - fundingReduction, 0);
    },
    isCompleteFunding (funding) {
      if (!funding || funding === {}) return false;
      if (!(funding.frequency && funding.nature && has(funding, 'customerParticipationRate'))) return false;
      if (funding.nature === FIXED && !funding.amountTTC) return false;
      if (funding.nature === HOURLY && (!funding.unitTTCRate || !funding.careHours)) return false;
      return true;
    },
    getMatchingFunding (subscription) {
      return this.fundings.find(fd => fd.subscription._id === subscription._id &&
        (fd.endDate ? moment().isBetween(fd.startDate, fd.endDate) : moment().isSameOrAfter(fd.startDate)));
    },
    showHistory (id) {
      this.selectedSubscription = this.subscriptions.find(sub => sub._id === id);
      this.subscriptionHistoryModal = true;
    },
    resetSubscriptionHistoryData () {
      this.subscriptionHistoryModal = false;
      this.selectedSubscription = {};
    },
    refreshSubscriptions (customer) {
      try {
        this.subscriptionsLoading = true;
        this.subscriptions = customer.subscriptions
          ? customer.subscriptions.map(sub => ({ ...getLastVersion(sub.versions, 'createdAt'), ...sub }))
          : [];
      } catch (e) {
        console.error(e);
      } finally {
        this.subscriptionsLoading = false;
      }
    },
  },
};
