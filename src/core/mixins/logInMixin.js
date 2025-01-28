import { mapGetters, mapState } from 'vuex';
import Authentication from '@api/Authentication';
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
      const auth = await Authentication.authenticate({ ...authenticationPayload, origin: WEBAPP });

      await this.$store.dispatch('main/fetchLoggedUser', auth.user._id);

      if (!this.loggedUser) throw new Error('Error on login');

      if (this.$route.query.from) return this.$router.replace({ path: this.$route.query.from });
      if (this.vendorRole) return this.$router.replace('/ad').catch((e) => {});
      return this.$router.replace('/').catch((e) => {});
    },
  },
};
