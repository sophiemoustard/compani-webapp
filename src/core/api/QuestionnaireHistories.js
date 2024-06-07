import axios from 'axios';
import { alenviAxios } from '@api/ressources/alenviAxios';
import { WEBAPP } from '../data/constants';

export default {
  async create (payload) {
    await axios.post(`${process.env.API_HOSTNAME}/questionnairehistories`, { ...payload, origin: WEBAPP });
  },
  async update (id, payload) {
    await alenviAxios.put(`${process.env.API_HOSTNAME}/questionnairehistories/${id}`, payload);
  },
};
