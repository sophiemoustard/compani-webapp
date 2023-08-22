import axios from 'axios';
import { WEBAPP } from '../data/constants';

export default {
  async create (payload) {
    await axios.post(`${process.env.API_HOSTNAME}/questionnairehistories`, { ...payload, origin: WEBAPP });
  },
};
