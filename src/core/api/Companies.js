import { alenviAxios } from '@api/ressources/alenviAxios';

export default {
  async updateById (id, data) {
    const companyRaw = await alenviAxios.put(`${process.env.API_HOSTNAME}/companies/${id}`, data);
    return companyRaw.data.data;
  },
  async getFirstIntervention () {
    const companyRaw = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/first-intervention`);
    return companyRaw.data.data.firstIntervention;
  },
  async list (params) {
    const companies = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies`, { params });
    return companies.data.data.companies;
  },
  async create (payload) {
    const company = await alenviAxios.post(`${process.env.API_HOSTNAME}/companies`, payload);
    return company.data.data.company;
  },
  async getById (id) {
    const company = await alenviAxios.get(`${process.env.API_HOSTNAME}/companies/${id}`);
    return company.data.data.company;
  },
};
