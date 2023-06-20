import { mapGetters } from 'vuex';
import pickBy from 'lodash/pickBy';
import pick from 'lodash/pick';
import omit from 'lodash/omit';
import get from 'lodash/get';
import Roles from '@api/Roles';
import Users from '@api/Users';
import Email from '@api/Email';
import Helpers from '@api/Helpers';
import UserCompanies from '@api/UserCompanies';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { HELPER } from '@data/constants';
import { clear, formatPhone, formatPhoneForPayload } from '@helpers/utils';
import { formatDate, ascendingSort } from '@helpers/date';

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
        { name: 'firstname', label: 'Prénom', align: 'left', field: row => get(row, 'user.identity.firstname') || '' },
        { name: 'lastname', label: 'Nom', align: 'left', field: row => get(row, 'user.identity.lastname') || '' },
        { name: 'email', label: 'Email', align: 'left', field: row => get(row, 'user.local.email') || '' },
        {
          name: 'phone',
          label: 'Téléphone',
          align: 'left',
          field: row => get(row, 'user.contact.phone') || '',
          format: formatPhone,
        },
        {
          name: 'startDate',
          label: 'Depuis le...',
          field: 'createdAt',
          align: 'left',
          format: formatDate,
          sort: ascendingSort,
        },
        { name: 'referent', label: 'Référent', align: 'left' },
        { name: 'actions', label: '', align: 'left', field: row => get(row, 'user._id') || '' },
      ],
      helpersPagination: { rowsPerPage: 0 },
      helpersLoading: false,
      referentHelper: {},
    };
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
    sortedHelpers () {
      return this.helpers.sort(
        (h1, h2) => (get(h1, 'user.identity.lastname') || '').localeCompare(get(h2, 'user.identity.lastname') || '')
      );
    },
  },
  methods: {
    // Refresh
    async getUserHelpers () {
      try {
        this.helpersLoading = true;
        this.helpers = await Helpers.list({ customer: this.customer._id });

        const referentHelper = this.helpers.find(h => h.referent);
        if (referentHelper) this.referentHelper = referentHelper._id;
      } catch (e) {
        this.helpers = [];
        console.error(e);
      } finally {
        this.helpersLoading = false;
      }
    },
    // Creation
    resetAddHelperForm () {
      this.v$.newHelper.$reset();
      this.newHelper = { ...clear(this.newHelper) };
      this.firstStep = true;
    },
    async formatHelper () {
      const roles = await Roles.list({ name: HELPER });
      if (roles.length === 0) throw new Error('Role not found');

      const payload = {
        local: { email: this.newHelper.local.email },
        customer: this.customer._id,
        role: roles[0]._id,
        identity: pickBy(this.newHelper.identity),
      };

      let phone = get(this.newHelper, 'contact.phone', null);
      if (phone) {
        phone = formatPhoneForPayload(phone);
        payload.contact = { phone };
        this.newHelper.contact.phone = phone;
      }

      return pickBy(payload);
    },
    async createHelper () {
      try {
        this.loading = true;
        this.v$.newHelper.$touch();
        if (this.v$.newHelper.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = await this.formatHelper();
        await Users.create(pickBy(payload));
        NotifyPositive('Aidant(e) créé(e)');
        await this.getUserHelpers();
        this.openNewHelperModal = false;

        await this.sendWelcome();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'aidant(e).');
      } finally {
        this.loading = false;
      }
    },
    async sendWelcome () {
      try {
        await Email.sendWelcome({ email: this.newHelper.local.email, type: HELPER });
        NotifyPositive('Email envoyé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi du mail.');
      }
    },
    async nextStep () {
      try {
        this.loading = true;
        this.v$.newHelper.local.email.$touch();
        if (this.v$.newHelper.local.email.$error) return NotifyWarning('Champs invalides');

        const userInfo = await Users.exists({ email: this.newHelper.local.email });
        const { user } = userInfo;

        const sameOrNoCompany = (!user.company && user._id) || user.company === this.company._id;
        if (!userInfo.exists) this.firstStep = false;
        else if (get(user, 'role.client') || !sameOrNoCompany) {
          NotifyNegative('Compte déjà existant.');
        } else {
          const roles = await Roles.list({ name: HELPER });
          if (roles.length === 0) throw new Error('Role not found');

          const payload = { role: roles[0]._id, customer: this.customer._id };
          if (!user.company) await UserCompanies.create({ user: user._id, company: this.customer.company });

          await Users.updateById(user._id, payload);
          NotifyPositive('Aidant(e) créé(e)');

          this.getUserHelpers();
          this.openNewHelperModal = false;
        }
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la création de l\'aidant(e).');
      } finally {
        this.loading = false;
      }
    },
    // Edition
    resetEditedHelperForm () {
      this.v$.editedHelper.$reset();
      this.editedHelper = { ...clear(this.editedHelper) };
      this.openEditedHelperModal = false;
    },
    async editHelper () {
      try {
        this.loading = true;
        this.v$.editedHelper.$touch();
        if (this.v$.editedHelper.$error) return NotifyWarning('Champ(s) invalide(s)');

        if (get(this.editedHelper, 'contact.phone')) {
          this.editedHelper.contact.phone = formatPhoneForPayload(this.editedHelper.contact.phone);
        }
        const payload = { ...omit(this.editedHelper, ['_id']) };
        delete payload.local;
        await Users.updateById(this.editedHelper._id, payload);
        NotifyPositive('Aidant(e) modifié(e)');

        await this.getUserHelpers();
        this.openEditedHelperModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'aidant(e).');
      } finally {
        this.loading = false;
      }
    },
    openEditionModalHelper (helperId) {
      const helperUser = this.helpers.map(h => h.user).find(u => u._id === helperId);
      this.editedHelper = {
        ...pick(helperUser, ['_id', 'local.email', 'identity.firstname', 'identity.lastname']),
        contact: { phone: get(helperUser, 'contact.phone') || '' },
      };
      this.openEditedHelperModal = true;
    },
    async updateReferentHelper (value) {
      try {
        await Helpers.update(value, { referent: true });

        await this.getUserHelpers();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition de l\'aidant(e) référent(e).');
      }
    },
    // Deletion
    async deleteHelper (helperId) {
      try {
        await Users.deleteById(helperId);

        await this.getUserHelpers();
        NotifyPositive('Aidant(e) supprimé(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'aidant(e).');
      }
    },
    validateHelperDeletion (helperId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer l\'aidant(e)&nbsp;?',
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteHelper(helperId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
  },
};
