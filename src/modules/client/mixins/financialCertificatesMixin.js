import Customers from '@api/Customers';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';

export const financialCertificatesMixin = {
  methods: {
    async deleteDocument (driveId) {
      try {
        const payload = { driveId };
        await Customers.deleteCertificates(this.customer._id, payload);
        await this.refreshCustomer();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    // Financial certificates
    validateFinancialCertifDeletion (driveId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce document&nbsp;?',
        html: true,
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
