import { mapState } from 'vuex';
import get from 'lodash/get';
import { BLUE_TEXT_LOGO } from '../data/constants';

export const sideMenuMixin = {
  data () {
    return {
      userFirstname: '',
      companiLogo: BLUE_TEXT_LOGO,
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
  },
  watch: {
    loggedUser () {
      this.userFirstname = this.setUserFirstname();
    },
  },
  created () {
    this.userFirstname = this.setUserFirstname();
  },
  methods: {
    setUserFirstname () {
      return (get(this.loggedUser, 'identity.firstname') || '').toUpperCase();
    },
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
