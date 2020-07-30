import { mapState, mapGetters } from 'vuex';
import get from 'lodash/get';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import { required, minValue } from 'vuelidate/lib/validators';
import Contracts from '@api/Contracts';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { minDate } from '@helpers/vuelidateCustomVal';
import nationalities from '@data/nationalities.js';
import { REQUIRED_LABEL } from '@data/constants';
import { generateContractFields } from 'src/modules/client/helpers/generateContractFields';

export const contractMixin = {
  data () {
    return {
      timeout: null,
      versionEditionModal: false,
      editedVersion: {},
      loading: false,
      selectedContract: { versions: [] },
      selectedVersion: {},
    }
  },
  validations () {
    return {
      newVersion: {
        weeklyHours: { required },
        startDate: { required },
        grossHourlyRate: { required },
      },
      editedVersion: {
        grossHourlyRate: { required, minValue: minValue(0) },
        startDate: { required, minDate: this.editedVersionMinStartDate ? minDate(this.editedVersionMinStartDate) : '' },
      },
    }
  },
  computed: {
    ...mapState('main', ['loggedUser']),
    ...mapGetters({ company: 'main/getCompany' }),
    isPreviousPayImpacted () {
      const startOfMonth = this.$moment().startOf('M');
      return startOfMonth.isAfter(this.selectedVersion.startDate) || startOfMonth.isAfter(this.editedVersion.startDate)
    },
    editedVersionMinStartDate () {
      if (!this.editedVersion.versionId) return '';

      const index = this.selectedContract.versions.findIndex(ver => ver._id === this.editedVersion.versionId)
      if (!index) return '';

      const previousVersion = this.selectedContract.versions[index - 1];
      return this.$moment(previousVersion.startDate).add(1, 'd').toISOString();
    },
    userFullName () {
      return `${this.auxiliary.identity.firstname} ${this.auxiliary.identity.lastname}`;
    },
    esignRedirection () {
      return {
        redirect: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=true`,
        redirectDecline: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=false`,
      }
    },
    isVersionUpdated () {
      if (this.selectedVersion.grossHourlyRate !== this.editedVersion.grossHourlyRate) return true;
      if (!this.$moment(this.selectedVersion.startDate).isSame(this.editedVersion.startDate)) return true;

      return !!get(this.selectedVersion, 'signature.eversignId') !== this.editedVersion.shouldBeSigned;
    },
  },
  methods: {
    grossHourlyRateError (validationObj) {
      if (get(validationObj, 'grossHourlyRate.required', null) === false) return REQUIRED_LABEL;
      else if (get(validationObj, 'grossHourlyRate.minValue', null) === false) return 'Taux horaire non valide';
      return '';
    },
    weeklyHoursError (validationObj) {
      if (get(validationObj, 'weeklyHours.required', null) === false) return REQUIRED_LABEL;
      else if (get(validationObj, 'weeklyHours.minValue', null) === false) {
        return 'Volume horaire hebdomadaire non valide';
      }
      return '';
    },
    generateContractSigners (signer) {
      return [
        { id: '1', name: this.userFullName, email: this.auxiliary.local.email },
        { id: '2', name: signer.name, email: signer.email },
      ];
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
        fields: generateContractFields(
          { user: this.auxiliary, contract: contract, initialContractStartDate: this.selectedContract.startDate }
        ),
        signers: this.generateContractSigners({
          name: `${this.loggedUser.identity.firstname} ${this.loggedUser.identity.lastname}`,
          email: this.loggedUser.local.email,
        }),
        title: `${title}Contrat Prestataire - ${this.userFullName}`,
      };
    },
    getContractTemplate () {
      return get(this.company, 'rhConfig.templates.contractWithCompany');
    },
    getVersionTemplate () {
      return get(this.company, 'rhConfig.templates.contractWithCompanyVersion');
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
        const params = { contractId: this.editedVersion.contractId, versionId: this.editedVersion.versionId }
        await Contracts.updateVersion(params, payload);
        await this.refreshContracts();

        this.resetVersionEditionModal();
        NotifyPositive('Contrat modifié.');
      } catch (e) {
        console.error(e);
        if (e.data && e.data.statusCode === 422) {
          this.$v.editedVersion.$reset();
          return NotifyNegative('La date de début du contrat doit etre antérieure aux évènements de l\'auxiliaire.');
        }
        NotifyNegative('Erreur lors de la modification du contrat.');
      } finally {
        this.loading = false;
      }
    },
    async editVersion () {
      if (!this.isVersionUpdated) {
        NotifyPositive('Pas de modification apportée au contrat.')
        return this.resetVersionEditionModal();
      }

      if (!this.isPreviousPayImpacted) return this.saveVersion();

      this.$q.dialog({
        title: 'Confirmation',
        message: 'Ce changement impacte une paie déjà effectuée. Vérifiez que vous ne pouvez pas créer un avenant ' +
          'prenant effet ce mois-ci. Confirmez-vous ce changement ?',
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
  beforeDestroy () {
    clearTimeout(this.timeout);
  },
};
