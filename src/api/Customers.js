import { alenviAxios } from './ressources/alenviAxios'

export default {
  async list (params) {
    const customersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/customers`, { params });
    return customersRaw.data.data.customers;
  },
  async listWithSubscriptions (params) {
    const customersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/customers/subscriptions`, { params });
    return customersRaw.data.data.customers;
  },
  async listBySector (params) {
    const customersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/customers/sectors`, { params });
    return customersRaw.data.data.customers;
  },
  async listWithBilledEvents (params) {
    const customersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/customers/billed-events`, { params });
    return customersRaw.data.data.customers;
  },
  async listWithCustomerContractSubscriptions () {
    const customersRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/customers/customer-contract-subscriptions`);
    return customersRaw.data.data.customers;
  },
  async getById (id) {
    const customerRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/customers/${id}`);
    return customerRaw.data.data.customer;
  },
  async create (data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/customers`, data);
  },
  async remove (id) {
    return alenviAxios.delete(`${process.env.API_HOSTNAME}/customers/${id}`);
  },
  async updateById (id, data) {
    return alenviAxios.put(`${process.env.API_HOSTNAME}/customers/${id}`, data);
  },
  async removeHelper (params) {
    return alenviAxios.delete(`${process.env.API_HOSTNAME}/customers/${params._id}/helpers/${params.helperId}`);
  },
  async addSubscription (id, data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/customers/${id}/subscriptions`, data);
  },
  async updateSubscription (params, data) {
    return alenviAxios.put(`${process.env.API_HOSTNAME}/customers/${params._id}/subscriptions/${params.subscriptionId}`, data);
  },
  async removeSubscription (params) {
    return alenviAxios.delete(`${process.env.API_HOSTNAME}/customers/${params._id}/subscriptions/${params.subscriptionId}`);
  },
  async getMandates (id) {
    const mandates = await alenviAxios.get(`${process.env.API_HOSTNAME}/customers/${id}/mandates`);
    return mandates.data.data.mandates;
  },
  async updateMandate (params, data) {
    return alenviAxios.put(`${process.env.API_HOSTNAME}/customers/${params._id}/mandates/${params.mandateId}`, data);
  },
  async getQuotes (id) {
    const quotes = await alenviAxios.get(`${process.env.API_HOSTNAME}/customers/${id}/quotes`);
    return quotes.data.data.quotes;
  },
  async addQuote (id, data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/customers/${id}/quotes`, data);
  },
  async createDriveFolder (id) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/customers/${id}/drivefolder`, {});
  },
  async addSubscriptionHistory (id, data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/customers/${id}/subscriptionshistory`, data);
  },
  async generateMandateSignatureRequest (params, data) {
    const signatureRequest = await alenviAxios.post(`${process.env.API_HOSTNAME}/customers/${params._id}/mandates/${params.mandateId}/esign`, data);
    return signatureRequest.data.data.signatureRequest;
  },
  async saveSignedDoc (params, data) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/customers/${params._id}/mandates/${params.mandateId}/savesigneddoc`, data);
  },
  async updateCertificates (id, payload) {
    return alenviAxios.put(`${process.env.API_HOSTNAME}/customers/${id}/certificates`, payload);
  },
  async addFunding (id, payload) {
    return alenviAxios.post(`${process.env.API_HOSTNAME}/customers/${id}/fundings`, payload);
  },
  async updateFunding (params, payload) {
    return alenviAxios.put(`${process.env.API_HOSTNAME}/customers/${params._id}/fundings/${params.fundingId}`, payload);
  },
  async removeFunding (params) {
    return alenviAxios.delete(`${process.env.API_HOSTNAME}/customers/${params._id}/fundings/${params.fundingId}`);
  },
}
