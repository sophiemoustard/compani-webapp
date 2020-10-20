import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import set from 'lodash/set';
import Companies from '@api/Companies';
import GoogleDrive from '@api/GoogleDrive';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { REQUIRED_LABEL } from '@data/constants';

export const configMixin = {
  data () {
    return {
      tmpInput: '',
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
    async updateCompany (path) {
      try {
        if (this.tmpInput === get(this.company, path)) return;
        if (get(this.$v.company, path)) {
          get(this.$v.company, path).$touch();
          const isValid = await this.waitForValidation(this.$v.company, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }

        const value = get(this.company, path);
        const payload = set({}, path, value);
        await Companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = '';
      }
    },
    nbrError (path, validations = this.$v) {
      if (get(validations, path).required === false) return REQUIRED_LABEL;
      if (get(validations, path).positiveNumber === false ||
      get(validations, path).numeric === false ||
      get(validations, path).maxValue === false) {
        return 'Nombre non valide';
      }
      return '';
    },
    // Documents
    async deleteDocument (driveId, type, key) {
      try {
        await GoogleDrive.removeFileById({ id: driveId });

        const payload = { [key]: { templates: { [type]: { driveId: null, link: null } } } };
        await Companies.updateById(this.company._id, payload);
        this.refreshCompany();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    validateDocumentDeletion (driveId, type, key) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteDocument(driveId, type, key))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    documentUploaded () {
      NotifyPositive('Document envoyé');
      this.refreshCompany();
    },
  },
};
