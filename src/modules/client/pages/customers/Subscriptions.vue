<template>
  <q-page padding class="client-background">
    <template v-if="customer">
      <div class="q-mb-lg">
        <ni-title-header title="Abonnement" class="q-mb-xl" />
        <p class="title">Souscriptions</p>
        <p v-if="subscriptions.length === 0">Aucun service souscrit.</p>
        <q-card v-if="subscriptions.length > 0" class="contract-cell">
          <ni-responsive-table :data="subscriptions" :columns="subscriptionsColumns" :loading="subscriptionsLoading"
            data-cy="subscriptions-table">
            <template #body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style" :data-cy="`col-${col.name}`">
                  <template v-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <ni-button icon="history" @click="showHistory(col.value)" data-cy="show-subscription-history" />
                      <ni-button :disable="!getSubscriptionFundings(col.value).length" icon="mdi-calculator"
                        @click="showSubscriptionFundings(col.value)" data-cy="show-fundings-history" />
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
        </q-card>
        <p v-if="subscriptions.length > 0" class="nota-bene">
          * intègre les éventuelles majorations soir / dimanche
        </p>
        <div v-if="subscriptions && subscriptions.length > 0" class="row">
          <div class="col-xs-12">
            <q-checkbox v-model="customer.subscriptionsAccepted" class="q-mr-sm" @update:model-value="confirmAgreement"
              :disable="customer.subscriptionsAccepted" dense />
            <span style="vertical-align: middle">
              J'accepte les conditions d’abonnement présentées ci-dessus ainsi que les
              <a href="#gcs" @click.prevent="gcsModal = true">
                conditions générales de services {{ helper.company.name }}.
              </a>
              <span class="text-weight-thin text-italic" data-cy="agreement">{{ agreement }}</span>
            </span>
          </div>
        </div>
      </div>
      <div class="q-mb-md">
        <p class="title">Financement APA ou autres financements</p>
        <div class="row gutter-profile items-center">
          <div class="col-xs-12 col-md-6">
            <ni-multiple-files-uploader path="financialCertificates" caption="Justificatif financement"
              @uploaded="documentUploadedForFinancialCertificates" name="financialCertificates" :url="docsUploadUrl"
              collapsible-label="Ajouter un justificatif" :user-profile="customer" :extensions="extensions" multiple
              @delete="validateFinancialCertifDeletion($event)" additional-fields-name="justificatif_financement" />
          </div>
          <div class="col-md-6 col-xs-12 q-mb-md">
            <p class="input-caption">Horodatage</p>
            <ni-bi-color-button icon="file_download" label="QR Code" size="16px" @click="downloadQRCode()" />
          </div>
        </div>
      </div>
      <div class="q-mb-lg">
        <p class="title">Paiement</p>
        <div class="row gutter-profile">
          <ni-input caption="Nom associé au compte bancaire" v-model="customer.payment.bankAccountOwner"
            :error="v$.customer.payment.bankAccountOwner.$error" @focus="saveTmp('payment.bankAccountOwner')"
            @blur="updateCustomer('payment.bankAccountOwner')" data-cy="bank-account-owner" />
          <ni-input caption="IBAN" v-model="customer.payment.iban" :error="v$.customer.payment.iban.$error"
            :error-message="ibanError" @focus="saveTmp('payment.iban')" @blur="updateCustomer('payment.iban')"
            data-cy="iban" />
          <ni-input caption="BIC" v-model="customer.payment.bic" :error="v$.customer.payment.bic.$error"
            :error-message="bicError" @focus="saveTmp('payment.bic')" @blur="updateCustomer('payment.bic')"
            data-cy="bic" />
        </div>
      </div>
      <div class="q-mb-lg">
        <p class="title">Mandats de prélèvement</p>
        <p v-if="customer.payment.mandates.length === 0 || !isValidPayment">Aucun mandat.</p>
        <q-card v-if="isValidPayment && customer.payment.mandates.length > 0" class="contract-cell">
          <ni-responsive-table :data="customer.payment.mandates" :columns="mandatesColumns" :loading="mandatesLoading"
            v-model:pagination="pagination" :visible-columns="mandatesVisibleColumns" data-cy="mandate-table">
            <template #body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'sign'">
                    <p class="no-margin" v-if="props.row.signedAt">Mandat signé le {{ getSignatureDate(props.row) }}</p>
                    <ni-button v-else-if="displaySignButton(props.row)" label="Signer" class="bg-primary"
                      color="copper-grey-50" data-cy="open-mandate" @click="preOpenESignModal(props.row)" />
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
        </q-card>
      </div>
    </template>
    <template v-else>
      <p>Vous n'avez pas de bénéficiaire.</p>
    </template>

    <!-- Mandate signature modal -->
    <q-dialog v-model="newESignModal" @hide="checkMandates" full-height full-width data-cy="esign-modal">
      <q-card class="full-height" style="width: 80vw">
        <q-card-section class="row justify-end no-wrap">
          <ni-button icon="close" @click="newESignModal = false" />
        </q-card-section>
        <q-card-section class="full-height">
          <iframe :src="embeddedUrl" frameborder="0" class="iframe-normal" />
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- CSG modal -->
    <ni-html-modal :title="htmlModalTitle" v-model="gcsModal" :html="gcs" @show="openGcsModal" @hide="closeGcsModal"
      :loading="gcsLoading" />

    <!-- Subscription history modal -->
    <ni-modal v-model="subscriptionHistoryModal" @hide="resetSubscriptionHistoryData">
      <template #title>
        Historique de la souscription <span class="text-weight-bold">{{ selectedSubscription.service &&
          selectedSubscription.service.name }}</span>
      </template>
      <ni-responsive-table class="q-mb-sm" :data="selectedSubscription.versions" :columns="subscriptionHistoryColumns"
        v-model:pagination="paginationHistory" data-cy="subscriptions-history" />
    </ni-modal>

    <!-- Funding modal -->
    <ni-modal v-model="fundingModal" @hide="resetFundingData" title="Financement">
      <ni-funding-grid-table :data="fundingData" :columns="fundingsColumns" data-cy="fundings-history" />
    </ni-modal>
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { mapState } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Esign from '@api/Esign';
import GoogleDrive from '@api/GoogleDrive';
import Customers from '@api/Customers';
import TitleHeader from '@components/TitleHeader';
import Input from '@components/form/Input';
import MultipleFilesUploader from '@components/form/MultipleFilesUploader';
import Button from '@components/Button';
import BiColorButton from '@components/BiColorButton';
import Modal from '@components/modal/Modal';
import HtmlModal from '@components/modal/HtmlModal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import { REQUIRED_LABEL, DOC_EXTENSIONS } from '@data/constants';
import { bic, iban } from '@helpers/vuelidateCustomVal';
import { getLastVersion } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import FundingGridTable from 'src/modules/client/components/table/FundingGridTable';
import { customerMixin } from 'src/modules/client/mixins/customerMixin';
import { subscriptionMixin } from 'src/modules/client/mixins/subscriptionMixin';
import { financialCertificatesMixin } from 'src/modules/client/mixins/financialCertificatesMixin';
import { fundingMixin } from 'src/modules/client/mixins/fundingMixin';
import { tableMixin } from 'src/modules/client/mixins/tableMixin';

export default {
  name: 'Subscriptions',
  components: {
    'ni-title-header': TitleHeader,
    'ni-input': Input,
    'ni-button': Button,
    'ni-multiple-files-uploader': MultipleFilesUploader,
    'ni-modal': Modal,
    'ni-html-modal': HtmlModal,
    'ni-responsive-table': ResponsiveTable,
    'ni-funding-grid-table': FundingGridTable,
    'ni-bi-color-button': BiColorButton,
  },
  mixins: [customerMixin, subscriptionMixin, financialCertificatesMixin, fundingMixin, tableMixin],
  data () {
    return {
      gcs: null,
      gcsModal: false,
      gcsLoading: false,
      agreed: false,
      tmpInput: null,
      newESignModal: false,
      embeddedUrl: '',
      mandatesLoading: false,
      mandatesColumns: [
        { name: 'rum', label: 'RUM', align: 'left', field: 'rum' },
        { name: 'sign', label: 'Signature', align: 'left', field: 'signedAt' },
        { name: '_id', field: '_id' },
      ],
      mandatesVisibleColumns: ['rum', 'sign'],
      fundingModal: false,
      fundingData: [],
      pagination: {
        sortBy: 'createdAt',
        ascending: true,
        rowsPerPage: 0,
      },
      extensions: DOC_EXTENSIONS,
    };
  },
  setup () {
    const metaInfo = { title: 'Souscriptions' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  validations () {
    return {
      customer: {
        payment: {
          bankAccountOwner: { required },
          bic: { required, bic },
          iban: { required, iban },
        },
      },
    };
  },
  computed: {
    ...mapState({
      helper: state => state.main.loggedUser,
      customer: state => state.customer.customer,
    }),
    ibanError () {
      if (!this.v$.customer.payment.iban.required) return REQUIRED_LABEL;
      if (!this.v$.customer.payment.iban.iban) return 'IBAN non valide';

      return '';
    },
    bicError () {
      if (!this.v$.customer.payment.bic.required) return REQUIRED_LABEL;
      if (!this.v$.customer.payment.bic.bic) return 'BIC non valide';

      return '';
    },
    agreement () {
      return this.lastSubscriptionHistory && this.customer.subscriptionsAccepted
        ? `(Accepté le ${formatDate(this.lastSubscriptionHistory.approvalDate)} par ${this.acceptedBy})`
        : '';
    },
    esignRedirection () {
      if (this.$q.platform.is.desktop) {
        return {
          redirect: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=true`,
          redirectDecline: `${process.env.COMPANI_HOSTNAME}/docsigned?signed=false`,
        };
      }
      return {
        redirect: `${process.env.COMPANI_HOSTNAME}/customers/subscriptions`,
        redirectDecline: `${process.env.COMPANI_HOSTNAME}/customers/subscriptions`,
      };
    },
    isValidPayment () {
      return get(this.v$, 'customer.payment.bic.bic.$response') === true &&
        get(this.v$, 'customer.payment.iban.iban.$response') === true;
    },
    docsUploadUrl () {
      return this.customer.driveFolder
        ? `${process.env.API_HOSTNAME}/customers/${this.customer._id}/gdrive/${this.customer.driveFolder.driveId}`
          + '/upload'
        : '';
    },
    htmlModalTitle () {
      return `Conditions Générales de Services ${this.helper.company.name}`;
    },
  },
  async created () {
    if (!this.customer) await this.refreshCustomer();
    else {
      this.refreshSubscriptions(this.customer);
      this.refreshFundings(this.customer);
    }
    await this.checkMandates();
  },
  mounted () {
    this.v$.customer.$touch();
  },
  methods: {
    getSignatureDate (mandate) {
      return formatDate(mandate.signedAt);
    },
    displaySignButton (mandate) {
      return this.getRowIndex(this.customer.payment.mandates, mandate) === this.customer.payment.mandates.length - 1;
    },
    documentUploadedForFinancialCertificates () {
      this.refreshCustomer();
    },
    async refreshCustomer () {
      try {
        this.mandatesLoading = true;
        const customer = await Customers.getById(this.helper.customers[0]);
        this.$store.dispatch('customer/setCustomer', customer);

        this.refreshSubscriptions(this.customer);
        this.refreshFundings(this.customer);

        this.v$.customer.$touch();
      } catch (e) {
        console.error(e);
      } finally {
        this.mandatesLoading = false;
      }
    },
    saveTmp (path) {
      this.tmpInput = get(this.customer, path);
    },
    // Customer
    async updateCustomer (path) {
      try {
        let value = get(this.customer, path);
        if (this.tmpInput === value) return;

        get(this.v$.customer, path).$touch();
        if (get(this.v$.customer, path).$error) return NotifyWarning('Champ(s) invalide(s)');

        if (path.match(/iban/i)) value = value.split(' ').join('');

        await Customers.updateById(this.customer._id, set({}, path, value));
        await this.$store.dispatch('main/fetchLoggedUser', this.helper._id);
        await this.refreshCustomer();
        NotifyPositive('Modification enregistrée');

        if (path.match(/iban/i)) {
          this.v$.customer.payment.bic.$touch();
          if (!this.v$.customer.payment.bic.required) return NotifyWarning('Merci de renseigner votre BIC');
        }
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = '';
      }
    },
    // Subscriptions
    async confirmAgreement () {
      try {
        if (this.customer.subscriptionsAccepted) {
          const subscriptions = this.customer.subscriptions.map((subscription) => {
            const lastVersion = getLastVersion(subscription.versions, 'createdAt');
            const obj = {
              subscriptionId: subscription._id,
              service: subscription.service.name,
              unitTTCRate: lastVersion.unitTTCRate,
              estimatedWeeklyVolume: lastVersion.estimatedWeeklyVolume,
              startDate: lastVersion.startDate,
            };
            if (lastVersion.evenings) obj.evenings = lastVersion.evenings;
            if (lastVersion.sundays) obj.sundays = lastVersion.sundays;
            return obj;
          });
          const payload = {
            subscriptions,
            helper: {
              firstname: this.helper.identity.firstname || '',
              lastname: this.helper.identity.lastname || '',
              title: this.helper.identity ? this.helper.identity.title : '',
            },
          };
          await Customers.addSubscriptionHistory(this.customer._id, payload);
          await this.refreshCustomer();
          NotifyPositive('Abonnement validé');
        }
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la validation de votre abonnement.');
        this.customer.subscriptionsAccepted = !this.customer.subscriptionsAccepted;
      }
    },
    // Mandate
    async preOpenESignModal (data) {
      try {
        this.$q.loading.show({ message: 'Contact du support de signature en ligne...' });
        const signatureRequest = await Customers.generateMandateSignatureRequest(
          { mandateId: data._id, _id: this.customer._id },
          {
            customer: {
              name: this.customer.identity.lastname,
              email: this.helper.local.email,
            },
            fileId: this.helper.company.customersConfig.templates.debitMandate.driveId,
            fields: {
              bankAccountOwner: this.customer.payment.bankAccountOwner || '',
              customerAddress: this.customer.contact.primaryAddress.fullAddress || '',
              ics: this.helper.company.ics || '',
              rum: data.rum || '',
              bic: this.customer.payment.bic || '',
              iban: this.customer.payment.iban || '',
              companyName: this.helper.company.name || '',
              companyAddress: this.helper.company.address.fullAddress || '',
              downloadDate: formatDate(new Date()),
            },
            ...this.esignRedirection,
          }
        );
        await this.refreshCustomer();
        this.embeddedUrl = signatureRequest.embeddedUrl;
        if (this.$q.platform.is.mobile) {
          window.location.href = this.embeddedUrl;
        } else {
          this.newESignModal = true;
        }
      } catch (e) {
        console.error(e);
        this.$q.loading.hide();
        this.newESignModal = false;
        NotifyNegative('Erreur lors de la requête de signature en ligne du mandat.');
      } finally {
        this.$q.loading.hide();
      }
    },
    async checkMandates () {
      try {
        if (this.customer.payment.mandates.length === 0) return;
        const mandates = this.customer.payment.mandates.filter(mandate => !mandate.drive && mandate.everSignId);
        if (mandates.length === 0) return;

        for (const mandate of mandates) {
          const hasSigned = await this.hasSignedDoc(mandate.everSignId);
          if (hasSigned) await Customers.saveSignedDoc({ _id: this.customer._id, mandateId: mandate._id });
        }

        await this.refreshCustomer();
      } catch (e) {
        console.error(e);
      }
    },
    async hasSignedDoc (docId) {
      try {
        const document = await Esign.getDocument(docId);
        return document.log.some(el => el.event === 'document_signed');
      } catch (e) {
        console.error(e);
      }
    },
    getSubscriptionFundings (subscriptionId) {
      return this.fundings.filter(fund => fund.subscription._id === subscriptionId);
    },
    showSubscriptionFundings (subscriptionId) {
      this.fundingData = this.getSubscriptionFundings(subscriptionId);
      this.fundingModal = true;
    },
    resetFundingData () {
      this.fundingData = [];
      this.fundingModal = false;
    },
    async openGcsModal () {
      try {
        this.gcsLoading = true;
        const gcsDriveId = get(this.helper, 'company.customersConfig.templates.gcs.driveId');
        if (!gcsDriveId) return;

        const file = await GoogleDrive.downloadFileById(gcsDriveId, true);

        this.gcs = file.data;
      } catch (e) {
        console.error(e);
      } finally {
        this.gcsLoading = false;
      }
    },
    closeGcsModal () {
      this.gcs = '';
    },
  },
};
</script>

<style lang="sass" scoped>
  .title
    font-size: 1.5em
    margin-bottom: 20px
  .nota-bene
    font-size: 0.8em
    margin-bottom: 20px
  .contract-cell
    background: white
    width: 100%
    margin-bottom: 10px
  .q-header
    position: sticky
  .iframe-normal
    position: absolute
    width: 100%
    height:100%
  .modal-layout
    background-color: white
  .table-grid table tr
    margin-bottom: 0px !important
  .q-dialog__inner
    &--minimized > div
      max-width: none
</style>
