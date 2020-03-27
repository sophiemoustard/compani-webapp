import get from 'lodash/get';
import has from 'lodash/has';
import set from 'lodash/set';
import Customers from '@api/Customers';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify.js';

export const customerMixin = {
  computed: {
    lastSubscriptionHistory () {
      if (this.customer.subscriptionsHistory && this.customer.subscriptionsHistory.length > 1) {
        const history = this.customer.subscriptionsHistory;
        return history.sort((a, b) => new Date(b.approvalDate) - new Date(a.approvalDate))[0];
      }
      if (this.customer.subscriptionsHistory && this.customer.subscriptionsHistory.length === 1) {
        return this.customer.subscriptionsHistory[0];
      }
      return {};
    },
    acceptedBy () {
      if (!has(this.lastSubscriptionHistory, 'helper.lastname')) return '';
      return `${this.lastSubscriptionHistory.helper.title || ''} ${this.lastSubscriptionHistory.helper.firstname || ''} ${this.lastSubscriptionHistory.helper.lastname}`;
    },
  },
  methods: {
    async updateCustomer (path) {
      try {
        let value = path === 'referent' ? get(this.customer, 'referent._id', '') : get(this.customer, path);
        if (this.tmpInput === value) return;
        if (this.$v && get(this.$v.customer, path)) {
          const isValid = await this.waitForValidation(this.$v.customer, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }
        if (path === 'payment.iban') value = value.split(' ').join('');
        const payload = set({}, path, value);
        await Customers.updateById(this.customer._id, payload);

        NotifyPositive('Modification enregistrée');
        if (path === 'payment.iban' || path === 'referent') this.refreshCustomer();

        this.$store.commit('customer/saveCustomer', this.customer);
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = null;
      }
    },
  },
};
