import { NotifyNegative, NotifyPositive, NotifyWarning } from '../components/popup/notify';

export const configMixin = {
  data () {
    return {
      tmpInput: '',
    };
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.company, path);
    },
    async updateCompany (path) {
      try {
        if (this.tmpInput === this.$_.get(this.company, path)) return;
        if (this.$_.get(this.$v.company, path)) {
          this.$_.get(this.$v.company, path).$touch();
          const isValid = await this.waitForValidation(this.$v.company, path);
          if (!isValid) return NotifyWarning('Champ(s) invalide(s)');
        }

        const value = this.$_.get(this.company, path);
        const payload = this.$_.set({}, path, value);
        await this.$companies.updateById(this.company._id, payload);
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = '';
      }
    },
    // Documents
    async deleteDocument (driveId, type, key) {
      try {
        await this.$gdrive.removeFileById({ id: driveId });
        const payload = {
          [key]: {
            templates: { [type]: { driveId: null, link: null } },
          },
        };
        await this.$companies.updateById(this.company._id, payload);
        this.refreshCompany();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    validateDocumentDeletion (driveId, type, key) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteDocument(driveId, type, key))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    documentUploaded () {
      NotifyPositive('Document envoyé');
      this.refreshCompany();
    },
  },
};
