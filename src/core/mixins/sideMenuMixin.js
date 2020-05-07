import { mapState } from 'vuex';
import { CLIENT } from '@data/constants'

export const sideMenuMixin = {
  computed: {
    ...mapState('main', ['loggedUser']),
    userFirstnameUpper () {
      return (this.loggedUser.identity.firstname || '').toUpperCase();
    },
    accessBothInterface () {
      return this.loggedUser.role.client && this.loggedUser.role.vendor;
    },
    companiLogo () {
      if (this.typeInterface === CLIENT) {
        return 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_test_rose.png';
      }
      return 'https://res.cloudinary.com/alenvi/image/upload/v1588778194/images/business/Compani/compani_test_burgundy.png';
    },
  },
  methods: {
    collapsibleOpening () {
      if (this.$refs[this.$route.meta.parent]) {
        this.activeRoutes[this.$route.meta.parent].open = true;
      }
    },
    collapsibleClosing (to, from) {
      if (this.$refs[from.meta.parent] && to.meta.parent !== from.meta.parent) {
        this.activeRoutes[from.meta.parent].open = false;
      }
    },
    switchInterface () {
      if (!this.accessBothInterface) return;

      if (this.typeInterface === 'client') this.$router.push({ path: '/ad' }).catch(e => {});
      else this.$router.push({ path: '/' }).catch(e => {});
    },
  },
};
