import { mapState } from 'vuex';
import get from 'lodash/get';
import pick from 'lodash/pick';
import {
  CLIENT_ADMIN,
  AUXILIARY,
  PLANNING_REFERENT,
  AUXILIARY_ROLES,
  COACH_ROLES,
} from '@data/constants';
import { defineAbilitiesFor } from '@helpers/ability';

export const menuItemsMixin = {
  data () {
    return {
      coachActiveRoutes: {
        courses: { open: false },
        customers: { open: false },
        teams: { open: false },
        billing: { open: false },
        pay: { open: false },
        exports: { open: false },
        configuration: { open: false },
      },
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    clientRole () {
      return get(this.loggedUser, 'role.client.name');
    },
    hasBillingAssistance () {
      return get(this.loggedUser, 'company.billingAssistance');
    },
    isAdmin () {
      return CLIENT_ADMIN === this.clientRole;
    },
    isAuxiliaryWithCompany () {
      return [AUXILIARY, PLANNING_REFERENT].includes(this.clientRole);
    },
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.clientRole);
    },
    isCoach () {
      return COACH_ROLES.includes(this.clientRole);
    },
    routes () {
      let routes = [];
      const ability = defineAbilitiesFor(pick(this.loggedUser, ['role', 'company']));

      if (this.isCoach) routes = this.coachRoutes;

      return routes
        .map(r => ({ ...r, children: r.children.filter(c => ability.can('read', c.name)) }))
        .filter(r => (r.children ? r.children.length : ability.can('read', r.name)));
    },
    activeRoutes () {
      if (this.isCoach) return this.coachActiveRoutes;
      return {};
    },
    coachRoutes () {
      return [
        {
          ref: 'customers',
          label: 'Bénéficiaires',
          children: [
            { name: 'ni customers', icon: 'contacts', label: 'Répertoire bénéficiaires' },
          ],
        },
        {
          ref: 'courses',
          label: 'Formations',
          children: [
            { name: 'ni courses dashboard', icon: 'assessment', label: 'Tableau de bord' },
            { name: 'ni courses', icon: 'mdi-teach', label: 'Formations mixtes' },
            { name: 'ni elearning courses', icon: 'stay_primary_portrait', label: 'Formations eLearning' },
            { name: 'ni courses learners', icon: 'contacts', label: 'Apprenants' },
            { name: 'ni courses bills', icon: 'receipt', label: 'Factures' },
            { name: 'ni courses contacts', icon: 'people', label: 'Contacts Compani' },
          ],
        },
        {
          ref: 'billing',
          label: 'Facturation',
          children: [
            { name: 'ni billing to bill', icon: 'credit_card', label: 'À facturer' },
            { name: 'ni billing manual bills', icon: 'receipt', label: 'Factures manuelles' },
            { name: 'ni billing automatic bills', icon: 'picture_as_pdf', label: 'Liste des factures' },
            { name: 'ni billing clients balances', icon: 'mdi-scale-balance', label: 'Balances clients' },
            { name: 'ni billing tpp bill slips', icon: 'view_headline', label: 'Bordereaux tiers payeurs' },
          ],
        },
        {
          ref: 'exports',
          label: 'Exports',
          children: [
            { name: 'ni exports data', icon: 'list_alt', label: 'Données' },
            { name: 'ni exports history', icon: 'history', label: 'Historique' },
          ],
        },
        {
          ref: 'configuration',
          label: 'Configuration',
          children: [
            { name: 'ni config company', icon: 'settings', label: 'Configuration générale' },
            { name: 'ni config customers', icon: 'house', label: 'Configuration bénéficiaires' },
            { name: 'ni config coach', icon: 'people', label: 'Coachs' },
          ],
        },
      ];
    },
  },
};
