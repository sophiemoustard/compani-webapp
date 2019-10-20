import { MONTH } from '../data/constants';

export const billingMixin = {
  methods: {
    setBillingDates () {
      const billingPeriod = this.user.company.customersConfig.billingPeriod;
      if (billingPeriod === MONTH) {
        this.billingDates = {
          endDate: this.$moment().subtract(1, 'M').endOf('month').toISOString(),
          startDate: this.$moment().subtract(1, 'M').startOf('month').toISOString(),
        };
      } else {
        this.billingDates = {
          endDate: this.$moment().date() > 15 ? this.$moment().date(15).endOf('d').toISOString()
            : this.$moment().subtract(1, 'M').endOf('month').toISOString(),
          startDate: this.$moment().date() > 15 ? this.$moment().startOf('month').toISOString()
            : this.$moment().subtract(1, 'M').date(16).startOf('d').toISOString(),
        }
      }
    },
  },
};
