import { NotifyPositive, NotifyNegative } from '../components/popup/notify';
import gdrive from '../api/GoogleDrive.js';

export const financialCertificatesMixin = {
  methods: {
    // Financial certificates
    async deleteDocument (driveId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
          ok: true,
          cancel: 'Annuler',
        });
        await gdrive.removeFileById({ id: driveId });

        const payload = { 'financialCertificates': { driveId } };
        await this.$customers.updateCertificates(this.customer._id, payload);
        this.refreshCustomer();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        if (e.message === '') return NotifyPositive('Suppression annulée');

        NotifyNegative('Erreur lors de la suppression du document');
      }
    },
    async documentUploaded () {
      await this.refreshCustomer();
      NotifyPositive('Document ajouté');
    },
  },
};
