export const menuItemsMixin = {
  data () {
    return {
      adminActiveRoutes: {
        users: { open: false },
        configuration: { open: false },
        management: { open: false },
      },
      trainerActiveRoutes: {
        administrative: { open: false },
        management: { open: false },
      },
      adminRoutes: [
        {
          ref: 'management',
          label: 'Gestion',
          children: [
            { name: 'ni management courses', icon: 'mdi-teach', label: 'Formations' },
          ],
        },
        {
          ref: 'users',
          label: 'Utilisateurs',
          children: [
            { name: 'ni users companies', icon: 'apartment', label: 'Structures' },
            { name: 'ni users trainers', icon: 'contacts', label: 'Formateurs' },
          ],
        },
        {
          ref: 'configuration',
          label: 'Configuration',
          children: [
            { name: 'ni users programs', icon: 'view_headline', label: 'Catalogue' },
          ],
        },
      ],
    }
  },
  computed: {
    routes () {
      if (this.isAdmin) return this.adminRoutes;
      else if (this.isTrainer) return this.trainerRoutes;
      else return [];
    },
    activeRoutes () {
      if (this.isAdmin) return this.adminActiveRoutes;
      else if (this.isTrainer) return this.trainerActiveRoutes;
      else return {};
    },
    trainerRoutes () {
      return [
        {
          ref: 'management',
          label: 'Gestion',
          children: [{ name: 'trainers courses', icon: 'mdi-teach', label: 'Formations' }],
        },
        {
          ref: 'administrative',
          label: 'Administration',
          children: [
            {
              name: 'trainers info',
              icon: 'person',
              label: 'Infos personnelles',
              params: { trainerId: this.loggedUser._id },
            },
          ],
        },
      ];
    },
  },
};
