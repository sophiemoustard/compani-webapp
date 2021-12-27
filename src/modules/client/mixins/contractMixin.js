import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import Contracts from '@api/Contracts';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import nationalities from '@data/nationalities';
import { REQUIRED_LABEL } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import moment from '@helpers/moment';
import { getContractTags } from 'src/modules/client/helpers/tags';

export const contractMixin = {
  data () {
    return {
      timeout: null,
      versionEditionModal: false,
      editedVersion: {},
      loading: false,
      selectedContract: { versions: [] },
      selectedVersion: {},
    };
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    ...mapGetters({ company: 'main/getCompany' }),
    isPreviousPayImpacted () {
      const startOfMonth = moment().startOf('M');

      return startOfMonth.isAfter(this.selectedVersion.startDate) || startOfMonth.isAfter(this.editedVersion.startDate);
    },
    newVersionMinStartDate () {
      const lastVersion = this.selectedContract.versions[this.selectedContract.versions.length - 1];

      return lastVersion ? moment(lastVersion.startDate).add(1, 'd').toISOString() : '';
    },
    editedVersionMinStartDate () {
      if (!this.editedVersion.versionId) return '';

      const index = this.selectedContract.versions.findIndex(ver => ver._id === this.editedVersion.versionId);
      if (!index) return '';

      const previousVersion = this.selectedContract.versions[index - 1];

      return moment(previousVersion.startDate).add(1, 'd').toISOString();
    },
    userFullName () {
      return `${this.auxiliary.identity.firstname} ${this.auxiliary.identity.lastname}`;
    },
    esignRedirection () {
      return {
        redirect: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=true`,
        redirectDecline: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=false`,
      };
    },
    isVersionUpdated () {
      if (this.selectedVersion.grossHourlyRate !== this.editedVersion.grossHourlyRate) return true;
      if (!moment(this.selectedVersion.startDate).isSame(this.editedVersion.startDate)) return true;

      return !!get(this.selectedVersion, 'signature.eversignId') !== this.editedVersion.shouldBeSigned;
    },
  },
  methods: {
    startDateError (validationObj) {
      if (get(validationObj, 'startDate.required', null) === false) return REQUIRED_LABEL;
      if (get(validationObj, 'startDate.minDate', null) === false) {
        return 'La date d\'effet doit être postérieure à la date de début de la version précédente.';
      }
      return '';
    },
    grossHourlyRateError (validationObj) {
      if (get(validationObj, 'grossHourlyRate.required', null) === false) return REQUIRED_LABEL;
      if (get(validationObj, 'grossHourlyRate.minValue', null) === false) return 'Taux horaire non valide';

      return '';
    },
    weeklyHoursError (validationObj) {
      if (get(validationObj, 'weeklyHours.required', null) === false) return REQUIRED_LABEL;
      if (get(validationObj, 'weeklyHours.minValue', null) === false) return 'Volume horaire hebdomadaire non valide';

      return '';
    },
    resetVersionEditionModal () {
      this.versionEditionModal = false;
      this.editedVersion = {};
      this.$v.editedVersion.$reset();
    },
    getSignaturePayload (contract, title, template) {
      return {
        ...this.esignRedirection,
        templateId: template.driveId,
        meta: { auxiliaryDriveId: this.auxiliary.administrative.driveFolder.driveId },
        fields: getContractTags({ user: this.auxiliary, version: contract, contract: this.selectedContract }),
        signers: [
          { id: '1', name: this.userFullName, email: this.auxiliary.local.email },
          { id: '2', name: formatIdentity(this.loggedUser.identity, 'FL'), email: this.loggedUser.local.email },
        ],
        title: `${title}Contrat Prestataire - ${this.userFullName}`,
      };
    },
    getContractTemplate () {
      return get(this.company, 'rhConfig.templates.contract');
    },
    getVersionTemplate () {
      return get(this.company, 'rhConfig.templates.contractVersion');
    },
    async getVersionEditionPayload () {
      const payload = pick(this.editedVersion, ['startDate', 'grossHourlyRate']);
      if (this.editedVersion.shouldBeSigned) {
        const versionMix = { ...this.selectedContract, ...this.editedVersion };
        const isContract = this.selectedContract.versions[0]._id === this.editedVersion.versionId;
        const template = isContract ? this.getContractTemplate() : this.getVersionTemplate();
        payload.signature = this.getSignaturePayload(versionMix, isContract ? '' : 'Avenant au ', template);
      }

      return pickBy(payload);
    },
    async saveVersion () {
      try {
        this.$v.editedVersion.$touch();
        if (this.$v.editedVersion.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = await this.getVersionEditionPayload();
        const params = { contractId: this.editedVersion.contractId, versionId: this.editedVersion.versionId };
        await Contracts.updateVersion(params, payload);
        await this.refreshContracts();

        this.resetVersionEditionModal();
        NotifyPositive('Contrat modifié.');
      } catch (e) {
        console.error(e);
        if (e.status === 422) {
          this.$v.editedVersion.$reset();
          return NotifyNegative(`Impossible de modifier ce contrat : il est en conflit avec les évènements ou autres
            contrats de l'auxiliaire.`);
        }
        NotifyNegative('Erreur lors de la modification du contrat.');
      } finally {
        this.loading = false;
      }
    },
    async editVersion () {
      if (!this.isVersionUpdated) {
        NotifyPositive('Pas de modification apportée au contrat.');
        return this.resetVersionEditionModal();
      }

      if (!this.isPreviousPayImpacted) return this.saveVersion();

      this.$q.dialog({
        title: 'Confirmation',
        message: `Ce changement impacte une paie déjà effectuée. Vérifiez que vous ne pouvez pas créer un avenant
          prenant effet ce mois-ci. <br /><br />Confirmez-vous ce changement ?`,
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(this.saveVersion)
        .onCancel(() => NotifyPositive('Modification annulée'));
    },
    getFullNationality (nationality) {
      return nationalities[nationality];
    },
    async refreshContractsWithTimeout () {
      await this.refreshContracts();
      this.timeout = setTimeout(() => this.refreshContracts(), 10000);
    },
  },
  beforeUnmount () {
    clearTimeout(this.timeout);
  },
};
