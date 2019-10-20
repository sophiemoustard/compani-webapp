
import randomize from 'randomatic';
import { clear, formatPhone } from '../helpers/utils.js';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '../components/popup/notify';
import { HELPER, REQUIRED_LABEL } from '../data/constants';

export const helperMixin = {
  data () {
    return {
      addHelper: false,
      openEditedHelperModal: false,
      newHelper: {
        identity: { lastname: '', firstname: '' },
        local: { email: '' },
        contact: { phone: '' },
      },
      editedHelper: {
        identity: { lastname: '', firstname: '' },
        local: { email: '' },
        contact: { phone: '' },
      },
      helpers: [],
      helperColumns: [
        {
          name: 'lastname',
          label: 'Nom',
          align: 'left',
          field: row => row.identity.lastname,
        },
        {
          name: 'firstname',
          label: 'Prénom',
          align: 'left',
          field: row => row.identity.firstname,
        },
        {
          name: 'email',
          label: 'Email',
          align: 'left',
          field: row => row.local ? row.local.email : '',
        },
        {
          name: 'phone',
          label: 'Téléphone',
          align: 'left',
          field: row => row.contact.phone,
          format: (value) => formatPhone(value),
        },
        {
          name: 'startDate',
          label: 'Depuis le...',
          field: 'createdAt',
          align: 'left',
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
        },
        {
          name: 'actions',
          label: '',
          align: 'left',
          field: '_id',
        },
      ],
      helperPagination: { rowsPerPage: 0 },
    }
  },
  computed: {
    sortedHelpers () {
      return [...this.helpers].sort((u1, u2) => {
        return (u1.identity.lastname || '').localeCompare((u2.identity.lastname || ''));
      });
    },
    emailError () {
      if (!this.$v.newHelper.local.email.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.newHelper.local.email.email) {
        return 'Email non valide';
      }
    },
    acceptedByHelper () {
      if (this.lastSubscriptionHistory && this.customer.subscriptionsAccepted) {
        return `le ${this.$moment(this.lastSubscriptionHistory.approvalDate).format('DD/MM/YYYY')} par ${this.acceptedBy}`;
      }
    },
  },
  methods: {
    // Refresh
    async getUserHelpers () {
      try {
        this.helpers = await this.$users.showAll({ customers: this.userProfile._id });
      } catch (e) {
        console.error(e);
      }
    },
    // Creation
    resetHelperForm () {
      this.$v.newHelper.$reset();
      this.newHelper = Object.assign({}, clear(this.newHelper));
    },
    resetEditedHelperForm () {
      this.$v.editedHelper.$reset();
      this.editedHelper = Object.assign({}, clear(this.editedHelper));
    },
    async createAlenviHelper () {
      this.newHelper.local.password = randomize('0', 6);
      this.newHelper.customers = [this.userProfile._id];
      const roles = await this.$roles.showAll({ name: HELPER });
      if (roles.length === 0) throw new Error('Role not found');
      this.newHelper.role = roles[0]._id;
      this.newHelper.company = this.company._id;
      this.newHelper.identity = this.$_.pickBy(this.newHelper.identity);
      const payload = this.$_.pickBy(this.newHelper);
      await this.$users.create(payload);
    },
    async sendWelcomingEmail () {
      await this.$email.sendWelcome({
        receiver: {
          email: this.newHelper.local.email,
          password: this.newHelper.local.password,
        },
      });
    },
    async submitHelper () {
      try {
        this.loading = true;
        this.$v.newHelper.$touch();
        if (this.$v.newHelper.$error) return NotifyWarning('Champ(s) invalide(s)');

        await this.createAlenviHelper();
        NotifyPositive('Aidant créé');

        await this.sendWelcomingEmail();
        NotifyPositive('Email envoyé');

        await this.getUserHelpers();
        this.addHelper = false
      } catch (e) {
        e.response ? console.error(e.response) : console.error(e);
        if (e && e.response && e.response.status === 409) return NotifyNegative('Cet email est déjà utilisé par un compte existant');
        NotifyNegative('Erreur lors de la création de l\'aidant');
      } finally {
        this.loading = false;
      }
    },
    async editHelper () {
      try {
        this.loading = true;
        this.$v.editedHelper.$touch();
        if (this.$v.editedHelper.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = Object.assign({}, this.editedHelper);
        delete payload.local;
        await this.$users.updateById(payload);
        NotifyPositive('Aidant modifié');

        await this.getUserHelpers();
        this.openEditedHelperModal = false
      } catch (e) {
        e.response ? console.error(e.response) : console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'aidant');
      } finally {
        this.loading = false;
      }
    },
    openEditionModalHelper (helperId) {
      const helper = this.helpers.find(helper => helper._id === helperId);
      this.editedHelper = this.$_.pick(helper, ['_id', 'contact.phone', 'local.email', 'identity.firstname', 'identity.lastname']);
      this.openEditedHelperModal = true;
    },
    async removeHelper (helperId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer cet aidant ?',
          ok: true,
          cancel: 'Annuler',
        });
        await this.$users.deleteById(helperId);
        NotifyPositive('Aidant supprimé');

        await this.getUserHelpers();
      } catch (e) {
        console.error(e);
      }
    },
  },
};
