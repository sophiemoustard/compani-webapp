import Users from '@api/Users';
import Customers from '@api/Customers';
import { HELPER, AUXILIARY_WITHOUT_COMPANY, AUXILIARY, PLANNING_REFERENT } from '@data/constants';

export const logInMixin = {
  methods: {
    async logInUser (authenticationPayload) {
      const auth = await Users.authenticate(authenticationPayload);

      const expiresInDays = parseInt(auth.expiresIn / 3600 / 24, 10) >= 1
        ? parseInt(auth.expiresIn / 3600 / 24, 10)
        : 1;
      const options = { path: '/', expires: expiresInDays, secure: process.env.NODE_ENV === 'production' };
      this.$q.cookies.set('alenvi_token', auth.token, options);
      this.$q.cookies.set('alenvi_token_expires_in', auth.expiresIn, options);
      this.$q.cookies.set('refresh_token', auth.refreshToken, { ...options, expires: 365 });
      this.$q.cookies.set('user_id', auth.user._id, options);
      await this.$store.dispatch('main/getLoggedUser', this.$q.cookies.get('user_id'));

      if (this.$route.query.from) return this.$router.replace({ path: this.$route.query.from });

      let customer;
      switch (this.userRole) {
        case HELPER:
          customer = await Customers.getById(this.loggedUser.customers[0]._id);
          this.$store.commit('customer/saveCustomer', customer);
          this.$router.replace({ name: 'customer agenda' });
          break;
        case AUXILIARY_WITHOUT_COMPANY:
          this.$router.replace({ name: 'client account info', params: { id: this.loggedUser._id } });
          break;
        case AUXILIARY:
        case PLANNING_REFERENT:
          this.$router.replace({ name: 'auxiliary agenda' });
          break;
        default:
          this.$router.replace({ name: 'auxiliaries directory' });
      }
    },
  },
}
