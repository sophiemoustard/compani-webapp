import { NotifyNegative, NotifyPositive } from '../components/popup/notify';

export const configMixin = {
  methods: {
    async deleteDocument (driveId, type, key) {
      await this.$gdrive.removeFileById({ id: driveId });
      const payload = {
        [key]: {
          templates: { [type]: { driveId: null, link: null } },
        },
      };
      await this.$companies.updateById(this.company._id, payload);
      this.refreshCompany();
      NotifyPositive('Document supprimé');
    },
    async validateDocumentDeletion (driveId, type, key) {
      try {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler',
        }).onOk(() => this.deleteDocument(driveId, type, key))
          .onCancel(() => NotifyPositive('Suppression annulée'));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    documentUploaded () {
      NotifyPositive('Document envoyé');
      this.refreshCompany();
    },
  },
};
