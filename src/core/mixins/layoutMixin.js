import { mapState } from 'vuex';

export const layoutMixin = {
  data () {
    return {
      isMini: false,
    };
  },
  computed: {
    ...mapState('main', ['loggedUser', 'drawer']),
    menuIcon () {
      return this.isMini ? 'view_headline' : 'chevron_left';
    },
    chevronClasses () {
      return !this.isMini ? 'chevron chevron-left' : 'chevron chevron-right';
    },
    chevronContainerClasses () {
      return !this.isMini ? 'absolute q-mini-drawer-hide' : 'absolute q-mini-drawer-only';
    },
  },
  methods: {
    toggleMenu (value) {
      this.$store.dispatch('main/setDrawer', value);
    },
  },
  beforeRouteUpdate (to, from, next) {
    if (this.drawer && !this.isMini) this.collapsibleClosing(to, from);

    next();
  },
};
