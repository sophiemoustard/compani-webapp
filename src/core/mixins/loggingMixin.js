import Users from '@api/Users';
import Customers from '@api/Customers';
import { HELPER } from '@data/constants';

export const loggingMixin = {
  methods: {
    async loggingUser (authenticationPayload) {
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

      if (this.userRole === HELPER) {
        const customer = await Customers.getById(this.loggedUser.customers[0]._id);
        this.$store.commit('customer/saveCustomer', customer);
        this.$router.replace({ name: 'customer agenda' });
      } else if (this.isAuxiliaryWithoutCompany) {
        this.$router.replace({ name: 'client account info', params: { id: this.loggedUser._id } });
      } else if (this.isAuxiliary) this.$router.replace({ name: 'auxiliary agenda' });
      else this.$router.replace({ name: 'auxiliaries directory' });
    },
  },
}
