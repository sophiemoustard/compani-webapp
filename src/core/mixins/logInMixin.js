import { mapGetters, mapState } from 'vuex';
import Users from '@api/Users';
import { cookieExpirationDate } from '../helpers/alenvi';
import { WEBAPP } from '../data/constants';

export const logInMixin = {
  computed: {
    ...mapGetters({
      clientRole: 'main/getClientRole',
      vendorRole: 'main/getVendorRole',
    }),
    ...mapState('main', ['loggedUser']),
  },
  methods: {
    async logInUser (authenticationPayload) {
      const auth = await Users.authenticate({ ...authenticationPayload, origin: WEBAPP });

      const options = { path: '/', secure: process.env.NODE_ENV !== 'development', sameSite: 'Lax' };
      const expireDate = cookieExpirationDate();

      this.$q.cookies.set('alenvi_token', auth.token, { ...options, expires: expireDate });
      this.$q.cookies.set('refresh_token', auth.refreshToken, { ...options, expires: 365 });
      this.$q.cookies.set('user_id', auth.user._id, { ...options, expires: expireDate });
      await this.$store.dispatch('main/fetchLoggedUser', auth.user._id);

      if (!this.loggedUser) throw new Error('Error on login');

      if (this.$route.query.from) return this.$router.replace({ path: this.$route.query.from });
      if (this.vendorRole && !this.clientRole) return this.$router.replace('/ad').catch((e) => {});
      return this.$router.replace('/').catch((e) => {});
    },
  },
};
