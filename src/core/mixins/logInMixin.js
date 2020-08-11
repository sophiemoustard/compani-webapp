import { mapGetters, mapState } from 'vuex';
import Users from '@api/Users';

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
      const auth = await Users.authenticate(authenticationPayload);

      const expiresInDays = parseInt(auth.expiresIn / 3600 / 24, 10) >= 1
        ? parseInt(auth.expiresIn / 3600 / 24, 10)
        : 1;
      const options = {
        path: '/',
        expires: expiresInDays,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'Strict',
      };
      this.$q.cookies.set('alenvi_token', auth.token, options);
      this.$q.cookies.set('alenvi_token_expires_in', auth.expiresIn, options);
      this.$q.cookies.set('refresh_token', auth.refreshToken, { ...options, expires: 365 });
      this.$q.cookies.set('user_id', auth.user._id, options);
      await this.$store.dispatch('main/fetchLoggedUser', auth.user._id);

      if (!this.loggedUser) throw new Error('Error on login');

      if (this.$route.query.from) return this.$router.replace({ path: this.$route.query.from });
      if (this.vendorRole && !this.clientRole) return this.$router.replace('/ad').catch(e => {});
      return this.$router.replace('/').catch(e => {});
    },
  },
}
