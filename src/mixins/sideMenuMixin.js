export const sideMenuMixin = {
  data () {
    return {
      companiLogo: 'https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_texte_rose_1000.png',
    }
  },
  computed: {
    userFirstnameUpper () {
      return this.user.identity.firstname.toUpperCase();
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
    collapsibleEntering (to) {
      if (this.$refs[to.meta.parent]) {
        this.activeRoutes[to.meta.parent].highlight = true;
      }
    },
  },
};
