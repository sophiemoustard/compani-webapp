import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import { extend } from '@helpers/utils';
import Companies from '@api/Companies';
import GoogleDrive from '@api/GoogleDrive';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { REQUIRED_LABEL } from '@data/constants';

export const configMixin = {
  data () {
    const companyModel = {
      address: { fullAddress: '' },
      legalRepresentative: { firstname: '', lastname: '', position: '' },
      customersConfig: { templates: {}, billFooter: '' },
      rhConfig: { templates: {} },
    };

    return {
      tmpInput: '',
      resetCompany: companyModel,
      company: companyModel,
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    ...mapGetters({ loggedCompany: 'main/getCompany' }),
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.company, path);
    },
    async refreshCompany () {
      await this.$store.dispatch('main/fetchLoggedUser', this.loggedUser._id);
      this.company = { ...extend(this.resetCompany, this.loggedCompany) };
      this.v$.company.$touch();
    },
    async updateCompany (path) {
      try {
        if (path === 'address' && this.tmpInput === get(this.company, 'address.fullAddress')) return;
        if (this.tmpInput === get(this.company, path)) return;

        if (get(this.v$.company, path)) {
          const isValid = await this.waitForValidation(this.v$.company, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }

        const payload = set({}, path, get(this.company, path));
        await Companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshCompany();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = '';
      }
    },
    nbrError (path, validations = this.v$) {
      const val = get(validations, path);
      if (get(val, 'required.$response') === false) return REQUIRED_LABEL;
      if (get(val, 'positiveNumber.$response') === false || get(val, 'numeric.$response') === false ||
        get(val, 'maxValue.$response') === false) return 'Nombre non valide';
      if (get(val, 'fractionDigits.$response') === false) return 'Décimales non valides';

      return '';
    },
    // Documents
    async deleteDocument (driveId, type, key) {
      try {
        await GoogleDrive.removeFileById({ id: driveId });

        const payload = { [key]: { templates: { [type]: { driveId: null, link: null } } } };
        await Companies.updateById(this.company._id, payload);

        await this.refreshCompany();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    validateDocumentDeletion (driveId, type, key) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteDocument(driveId, type, key))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async documentUploaded () {
      NotifyPositive('Document envoyé');
      await this.refreshCompany();
    },
  },
};
