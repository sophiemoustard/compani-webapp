import get from 'lodash/get';
import Customers from '@api/Customers';
import { customerProfileValidation } from 'src/modules/client/helpers/customerProfileValidation';

export default {
  namespaced: true,
  state: {
    customer: null,
    notifications: {
      profiles: {},
    },
  },
  mutations: {
    SET_CUSTOMER: (state, data) => { state.customer = data ? ({ ...data }) : data; },
    SET_NOTIFICATION: (state, notification) => {
      if (!notification) {
        state.notifications = {};
        return;
      }
      state.notifications[notification.type] = {
        ...state.notifications[notification.type],
        [notification._id]: notification.exists,
      };
    },
  },
  actions: {
    fetchCustomer: async ({ commit }, params) => {
      try {
        const customer = await Customers.getById(params.customerId);
        if (!get(customer, 'referent._id')) customer.referent = { _id: '' };
        if (!get(customer, 'contact')) customer.contact = {};
        if (!get(customer, 'followUp')) customer.followUp = {};
        if (!get(customer, 'contact.secondaryAddress')) customer.contact.secondaryAddress = {};

        commit('SET_CUSTOMER', customer);
      } catch (e) {
        console.error(e);
      }
    },
    setCustomer: ({ commit }, data) => commit('SET_CUSTOMER', data),
    updateNotifications: async ({ commit, state }) => {
      const { customer } = state;
      const validation = customerProfileValidation(customer);
      commit('SET_NOTIFICATION', { type: 'profiles', _id: customer._id, exists: !!validation.error });
    },
    resetCustomer: ({ commit }) => {
      commit('SET_CUSTOMER', null);
      commit('SET_NOTIFICATION', null);
    },
  },
  getters: {
    getCustomer: state => state.customer,
    getNotifications: state => state.notifications,
  },
};
