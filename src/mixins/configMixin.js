import { NotifyNegative, NotifyPositive } from '../components/popup/notify';

export const configMixin = {
  methods: {
    async deleteDocument (driveId, type, key) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler',
        });
        await this.$gdrive.removeFileById({ id: driveId });
        const payload = {
          [key]: {
            templates: {
              [type]: { driveId: null, link: null },
            },
          },
        };
        await this.$companies.updateById(this.company._id, payload);
        this.refreshCompany();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        if (e.message === '') {
          return NotifyPositive('Suppression annulée');
        }
        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    documentUploaded () {
      NotifyPositive('Document envoyé');
      this.refreshCompany();
    },
  },
};
