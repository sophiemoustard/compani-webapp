export const menuItemsMixin = {
  data () {
    return {
      adminActiveRoutes: {
        management: { open: false },
        users: { open: false },
        billing: { open: false },
        pedagogy: { open: false },
        exports: { open: false },
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
          ref: 'billing',
          label: 'Facturation',
          children: [
            { name: 'ni billing config vendor', icon: 'settings', label: 'Configuration' },
          ],
        },
        {
          ref: 'pedagogy',
          label: 'Pédagogie',
          children: [
            { name: 'ni pedagogy programs', icon: 'view_headline', label: 'Catalogue' },
            { name: 'ni pedagogy categories', icon: 'category', label: 'Catégories' },
            { name: 'ni pedagogy questionnaires', icon: 'assessment', label: 'Questionnaires' },
          ],
        },
        {
          ref: 'exports',
          label: 'Exports',
          children: [
            { name: 'ni exports history vendor', icon: 'history', label: 'Historique' },
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
