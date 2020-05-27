import { mapGetters } from 'vuex';
import get from 'lodash/get';
import Customers from '@api/Customers';
import {
  CLIENT_ADMIN,
  AUXILIARY,
  PLANNING_REFERENT,
  AUXILIARY_ROLES,
  COACH_ROLES,
  HELPER,
} from '@data/constants';
import { defineAbilitiesFor } from '@helpers/ability';

export const menuItemsMixin = {
  data () {
    return {
      customerActiveRoutes: {
        planning: { open: false },
        customers: { open: false },
        administrative: { open: false },
        teams: { open: false },
      },
      coachActiveRoutes: {
        courses: { open: false },
        planning: { open: false },
        customers: { open: false },
        teams: { open: false },
        billing: { open: false },
        pay: { open: false },
        exports: { open: false },
        configuration: { open: false },
      },
      auxiliaryActiveRoutes: {
        planning: { open: false },
        customers: { open: false },
        administrative: { open: false },
        teams: { open: false },
      },
    }
  },
  computed: {
    ...mapGetters({ company: 'main/company', clientRole: 'main/clientRole' }),
    customer () {
      return this.isHelper ? this.$store.getters['customer/getCustomer'] : null;
    },
    hasContracts () {
      return this.loggedUser && this.loggedUser.customers && this.loggedUser.customers.length > 0 &&
        this.loggedUser.customers[0].contracts && this.loggedUser.customers[0].contracts.length > 0;
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
    isHelper () {
      return this.clientRole === HELPER;
    },
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.clientRole);
    },
    isCoach () {
      return COACH_ROLES.includes(this.clientRole);
    },
    routes () {
      if (this.isHelper) return this.customerRoutes;
      else if (this.isCoach) return this.coachRoutes;
      else if (this.isAuxiliary) return this.auxiliaryRoutes;
      else return {};
    },
    activeRoutes () {
      if (this.isHelper) {
        return {
          planning: { open: false },
          customers: { open: false },
          administrative: { open: false },
          teams: { open: false },
        };
      } else if (this.isCoach) return this.coachActiveRoutes;
      else if (this.isAuxiliary) return this.auxiliaryActiveRoutes;
      else return {};
    },
    footerLabel () {
      if (this.isCoach || this.isAuxiliary) return this.userFirstnameUpper;
      else return this.loggedUser.identity.lastname;
    },
    customerRoutes () {
      const routes = [
        { name: 'customers agenda', icon: 'date_range', label: 'Planning' },
        this.hasBillingAssistance || (this.customer && this.customer.referent)
          ? { name: 'customers contact', icon: 'contact_support', label: 'Contact' }
          : {},
        { name: 'customers documents', icon: 'euro_symbol', label: 'Facturation' },
        { name: 'customers subscription', icon: 'playlist_add', label: 'Abonnement' },
        this.hasContracts
          ? { name: 'customers contracts', icon: 'description', label: 'Contrats' }
          : {},
      ];

      const ability = defineAbilitiesFor(this.clientRole, null, this.company);

      return routes.filter(r => ability.can('read', r.name));
    },
    coachRoutes () {
      const routes = [
        {
          ref: 'teams',
          label: 'Équipes',
          children: [
            { name: 'ni auxiliaries', icon: 'contacts', label: 'Répertoire auxiliaires' },
            { name: 'ni auxiliaries staff register', icon: 'view_headline', label: 'Registre unique du personnel' },
            { name: 'ni auxiliaries dashboard', icon: 'dashboard', label: 'Tableau de bord' },
          ],
        }, {
          ref: 'planning',
          label: 'Planning',
          children: [
            { name: 'ni planning auxiliaries', icon: 'date_range', label: 'Auxiliaires' },
            { name: 'ni planning customers', icon: 'date_range', label: 'Bénéficiaires' },
          ],
        }, {
          ref: 'customers',
          label: 'Beneficiaires',
          children: [
            { name: 'ni customers', icon: 'contacts', label: 'Répertoire bénéficiaires' },
            { name: 'ni customers fundings monitoring', icon: 'view_headline', label: "Suivi des plans d'aide" },
          ],
        }, {
          ref: 'courses',
          label: 'Formations',
          children: [
            { name: 'ni courses', icon: 'mdi-teach', label: 'Mes formations' },
          ],
        }, {
          ref: 'billing',
          label: 'Facturation',
          children: [
            { name: 'ni billing to bill', icon: 'credit_card', label: 'À facturer' },
            { name: 'ni billing credit note', icon: 'mdi-credit-card-refund', label: 'Avoirs' },
            { name: 'ni billing clients balances', icon: 'mdi-scale-balance', label: 'Balances clients' },
            { name: 'ni billing tpp bill slips', icon: 'view_headline', label: 'Bordereaux tiers payeurs' },
            { name: 'ni billing debits archive', icon: 'mdi-archive', label: 'Archive prélèvements' },
          ],
        }, {
          ref: 'pay',
          label: 'Paie',
          children: [
            { name: 'ni pay contract monitoring', icon: 'insert_drive_file', label: 'Suivi Contracts/Avenants' },
            { name: 'ni pay absences', icon: 'calendar_today', label: 'Absences' },
            { name: 'ni pay contract ends', icon: 'description', label: 'STC' },
            { name: 'ni pay to pay', icon: 'euro_symbol', label: 'Paie mensuelle' },
          ],
        }, {
          ref: 'exports',
          label: 'Exports',
          children: [
            { name: 'ni exports data', icon: 'list_alt', label: 'Données' },
            { name: 'ni exports history', icon: 'history', label: 'Historique' },
          ],
        }, {
          ref: 'configuration',
          label: 'Configuration',
          children: [
            { name: 'ni config company', icon: 'house', label: 'Configuration générale' },
            { name: 'ni config rh', icon: 'accessibility', label: 'Configuration RH' },
            { name: 'ni config customers', icon: 'settings', label: 'Configuration bénéficiaires' },
            { name: 'ni config coach', icon: 'people', label: 'Coachs' },
            { name: 'ni config tags', icon: 'list_alt', label: 'Tags' },
          ],
        },
      ];

      const ability = defineAbilitiesFor(this.clientRole, null, this.company);

      return routes
        .map(r => ({ ...r, children: r.children.filter(c => ability.can('read', c.name)) }))
        .filter(r => r.children.length);
    },
    auxiliaryRoutes () {
      const routes = [
        {
          ref: 'planning',
          label: 'Planning',
          children: [
            { name: 'auxiliaries agenda', icon: 'event', label: 'Le mien' },
            { name: 'ni planning auxiliaries', icon: 'face', label: 'Auxiliaires' },
            { name: 'ni planning customers', icon: 'people', label: 'Bénéficiaires' },
          ],
        }, {
          ref: 'customers',
          label: 'Beneficiaires',
          children: [
            { name: 'auxiliaries customers', icon: 'contacts', label: 'Fiches' },
            { name: 'ni customers fundings monitoring', icon: 'view_headline', label: "Suivi des plans d'aide" },
          ],
        }, {
          ref: 'administrative',
          label: 'Administratif',
          children: [
            {
              name: 'auxiliaries info',
              params: { id: this.loggedUser._id },
              icon: 'person',
              label: 'Infos personnelles',
            },
            { name: 'auxiliaries pay', params: { id: this.loggedUser._id }, icon: 'layers', label: 'Paie' },
            {
              name: 'auxiliaries docs',
              params: { id: this.loggedUser._id },
              icon: 'insert_drive_file',
              label: 'Documents',
            },
            { name: 'auxiliaries contracts', icon: 'description', label: 'Contrats' },
          ],
        }, {
          ref: 'teams',
          label: 'Équipes',
          children: [
            { name: 'auxiliaries teams', icon: 'contacts', label: 'Répertoire' },
            { name: 'ni auxiliaries dashboard', icon: 'dashboard', label: 'Tableau de bord' },
          ],
        },
      ];

      const ability = defineAbilitiesFor(this.clientRole, null, this.company);

      return routes
        .map(r => ({ ...r, children: r.children.filter(c => ability.can('read', c.name)) }))
        .filter(r => r.children.length);
    },
  },
  methods: {
    async refreshCustomer () {
      if (this.loggedUser && this.loggedUser.customers) {
        const customer = await Customers.getById(this.loggedUser.customers[0]._id);
        this.$store.commit('customer/saveCustomer', customer);
      }
    },
  },
};
