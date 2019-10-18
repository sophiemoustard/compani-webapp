import axios from 'axios'

export default {
  async authenticate (data) {
    const authenticatedUser = await axios.post(`${process.env.API_HOSTNAME}/bot/authorize`, data)
    return authenticatedUser;
  },
};
