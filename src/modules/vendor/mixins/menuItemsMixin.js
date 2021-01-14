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
            { name: 'ni management blended courses', icon: 'mdi-teach', label: 'Formations mixtes' },
            { name: 'ni management elearning courses', icon: 'stay_primary_portrait', label: 'Formations eLearning' },
          ],
        },
        {
          ref: 'users',
          label: 'Utilisateurs',
          children: [
            { name: 'ni users companies', icon: 'apartment', label: 'Structures' },
            { name: 'ni users trainers', icon: 'contacts', label: 'Formateurs' },
            { name: 'ni users learners', icon: 'contacts', label: 'Apprenants' },
          ],
        },
        {
          ref: 'configuration',
          label: 'Configuration',
          children: [
            { name: 'ni config programs', icon: 'view_headline', label: 'Catalogue' },
            { name: 'ni config categories', icon: 'category', label: 'Catégories' },
          ],
        },
      ],
    };
  },
  computed: {
    routes () {
      if (this.isAdmin) return this.adminRoutes;
      if (this.isTrainer) return this.trainerRoutes;
      return [];
    },
    activeRoutes () {
      if (this.isAdmin) return this.adminActiveRoutes;
      if (this.isTrainer) return this.trainerActiveRoutes;
      return {};
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
            },
          ],
        },
      ];
    },
  },
};
