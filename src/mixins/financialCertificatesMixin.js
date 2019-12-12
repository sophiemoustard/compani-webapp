import { NotifyPositive, NotifyNegative } from '../components/popup/notify';
import gdrive from '../api/GoogleDrive.js';

export const financialCertificatesMixin = {
  methods: {
    async deleteDocument (driveId) {
      try {
        await gdrive.removeFileById({ id: driveId });
        const payload = { 'financialCertificates': { driveId } };
        await this.$customers.updateCertificates(this.customer._id, payload);
        this.refreshCustomer();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document')
      }
    },
    // Financial certificates
    validateFinancialCertifDeletion (driveId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce document ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteDocument(driveId))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    async documentUploaded () {
      await this.refreshCustomer();
      NotifyPositive('Document ajouté');
    },
  },
};
