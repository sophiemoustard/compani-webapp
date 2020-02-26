export const layoutMixin = {
  data () {
    return {
      isMini: false,
    };
  },
  computed: {
    user () {
      return this.$store.getters['main/user'];
    },
    menuIcon () {
      return this.isMini ? 'view_headline' : 'chevron_left';
    },
    toggleDrawer () {
      return this.$store.state.main.toggleDrawer;
    },
    chevronClasses () {
      return !this.isMini ? 'chevron chevron-left' : 'chevron chevron-right';
    },
    chevronContainerClasses () {
      return !this.isMini ? 'absolute q-mini-drawer-hide' : 'absolute q-mini-drawer-only'
    },
  },
  methods: {
    toggleMenu (value) {
      this.$store.commit('main/setToggleDrawer', value);
    },
  },
  beforeRouteUpdate (to, from, next) {
    if (this.toggleDrawer && !this.isMini) this.$refs[this.sidemenusRefs].collapsibleClosing(to, from);

    next();
  },
};
