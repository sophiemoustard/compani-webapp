import { mapState } from 'vuex';
import get from 'lodash/get';
import { CLIENT } from '@data/constants';

export const sideMenuMixin = {
  computed: {
    ...mapState('main', ['loggedUser']),
    userFirstnameUpper () {
      return (get(this.loggedUser, 'identity.firstname') || '').toUpperCase();
    },
    companiLogo () {
      return this.interfaceType === CLIENT
        ? 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_texte_rose.png'
        : 'https://res.cloudinary.com/alenvi/image/upload/v1588778194/images/business/Compani/compani_texte_bordeaux.png';
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
  },
};
