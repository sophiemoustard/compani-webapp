import Customers from '@api/Customers';
import { customerProfileValidation } from 'src/modules/client/helpers/customerProfileValidation';

export const getCustomer = async ({ commit }, params) => {
  try {
    const customer = await Customers.getById(params.customerId);
    commit('saveCustomer', customer);
  } catch (e) {
    console.error(e);
  }
}

export const updateNotifications = async ({ commit, state }) => {
  const customer = state.customer;
  const validation = customerProfileValidation(customer);
  commit('saveNotification', { type: 'profiles', _id: customer._id, exists: !!validation.error });
};
