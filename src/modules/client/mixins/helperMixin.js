import { mapGetters } from 'vuex';
import has from 'lodash/has';
import pickBy from 'lodash/pickBy';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import get from 'lodash/get';
import Roles from '@api/Roles';
import Users from '@api/Users';
import Email from '@api/Email';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { clear, formatPhone } from '@helpers/utils';
import { HELPER } from '@data/constants';

export const helperMixin = {
  data () {
    return {
      openNewHelperModal: false,
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
      helpersColumns: [
        { name: 'lastname', label: 'Nom', align: 'left', field: row => row.identity.lastname },
        { name: 'firstname', label: 'Prénom', align: 'left', field: row => row.identity.firstname },
        { name: 'email', label: 'Email', align: 'left', field: row => get(row, 'local.email') || '' },
        {
          name: 'phone',
          label: 'Téléphone',
          align: 'left',
          field: row => get(row, 'contact.phone') || '',
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
        { name: 'actions', label: '', align: 'left', field: '_id' },
      ],
      helpersPagination: { rowsPerPage: 0 },
      helpersLoading: false,
    }
  },
  computed: {
    ...mapGetters({ company: 'main/company' }),
    sortedHelpers () {
      return [...this.helpers]
        .sort((u1, u2) => (u1.identity.lastname || '').localeCompare((u2.identity.lastname || '')));
    },
    acceptedByHelper () {
      if (this.lastSubscriptionHistory && this.customer.subscriptionsAccepted) {
        const approvalDate = this.$moment(this.lastSubscriptionHistory.approvalDate).format('DD/MM/YYYY');
        return `le ${approvalDate} par ${this.acceptedBy}`;
      }
    },
  },
  methods: {
    // Refresh
    async getUserHelpers () {
      try {
        this.helpersLoading = true;
        const params = { customers: this.customer._id };
        if (has(this.company, '_id')) params.company = this.company._id;
        this.helpers = await Users.list(params);
      } catch (e) {
        this.helpers = [];
        console.error(e);
      } finally {
        this.helpersLoading = false;
      }
    },
    // Creation
    resetAddHelperForm () {
      this.$v.newHelper.$reset();
      this.newHelper = Object.assign({}, clear(this.newHelper));
      this.openNewHelperModal = false;
    },
    resetEditedHelperForm () {
      this.$v.editedHelper.$reset();
      this.editedHelper = Object.assign({}, clear(this.editedHelper));
      this.openEditedHelperModal = false;
    },
    async formatHelper () {
      const roles = await Roles.list({ name: HELPER });
      if (roles.length === 0) throw new Error('Role not found');

      const payload = {
        local: { email: this.newHelper.local.email },
        customers: [this.customer._id],
        role: roles[0]._id,
        identity: pickBy(this.newHelper.identity),
      };
      const phone = get(this.newHelper, 'contact.phone', null);
      if (phone) payload.contact = { phone };

      return pickBy(payload);
    },
    async submitHelper () {
      try {
        this.loading = true;
        this.$v.newHelper.$touch();
        if (this.$v.newHelper.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = await this.formatHelper();
        await Users.create(pickBy(payload));
        NotifyPositive('Aidant créé');

        await Email.sendWelcome({ email: this.newHelper.local.email });
        NotifyPositive('Email envoyé');

        await this.getUserHelpers();
        this.openNewHelperModal = false;
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative('Cet email est déjà utilisé par un compte existant.');
        NotifyNegative('Erreur lors de la création de l\'aidant.');
      } finally {
        this.loading = false;
      }
    },
    async editHelper () {
      try {
        this.loading = true;
        this.$v.editedHelper.$touch();
        if (this.$v.editedHelper.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = Object.assign({}, omit(this.editedHelper, ['_id']));
        delete payload.local;
        await Users.updateById(this.editedHelper._id, payload);
        NotifyPositive('Aidant modifié');

        await this.getUserHelpers();
        this.openEditedHelperModal = false
      } catch (e) {
        NotifyNegative('Erreur lors de la modification de l\'aidant.');
      } finally {
        this.loading = false;
      }
    },
    openEditionModalHelper (helperId) {
      const helper = this.helpers.find(helper => helper._id === helperId);
      this.editedHelper = {
        ...pick(helper, ['_id', 'local.email', 'identity.firstname', 'identity.lastname']),
        contact: { phone: get(helper, 'contact.phone') || '' },
      };
      this.openEditedHelperModal = true;
    },
    async deleteHelper (helperId) {
      try {
        await Users.deleteById(helperId);
        await this.getUserHelpers();
        NotifyPositive('Aidant supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la suppression de l'aidant.");
      }
    },
    validateHelperDeletion (helperId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer cet aidant ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteHelper(helperId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
};
