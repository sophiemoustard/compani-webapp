<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Identité</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Prénom" v-model.trim="customer.identity.firstname" @focus="saveTmp('identity.firstname')"
          @blur="updateCustomer('identity.firstname')" />
        <ni-input caption="Nom" :error="$v.customer.identity.lastname.$error" v-model.trim="customer.identity.lastname"
          @focus="saveTmp('identity.lastname')" @blur="updateCustomer('identity.lastname')" />
        <ni-select caption="Civilité" :error="$v.customer.identity.title.$error" v-model="customer.identity.title"
          :options="civilityOptions" @focus="saveTmp('identity.title')" @blur="updateCustomer('identity.title')"
          in-form />
        <ni-date-input v-model="customer.identity.birthDate" @focus="saveTmp('identity.birthDate')"
          caption="Date de naissance" @blur="updateCustomer('identity.birthDate')" content-class="col-xs-12 col-md-6" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
      </div>
      <div class="row gutter-profile">
        <ni-search-address v-model="customer.contact.primaryAddress" :error-message="primaryAddressError"
          :error="$v.customer.contact.primaryAddress.$error" caption="Adresse principale"
          @focus="saveTmp('contact.primaryAddress.fullAddress')" @blur="updateCustomer('contact.primaryAddress')" />
        <ni-search-address v-model="customer.contact.secondaryAddress" caption="Adresse secondaire"
          error-message="Adresse non valide" :error="$v.customer.contact.secondaryAddress.$error"
          @focus="saveTmp('contact.secondaryAddress.fullAddress')" @blur="updateCustomer('contact.secondaryAddress')" />
        <ni-input caption="Téléphone" type="tel" :error="$v.customer.contact.phone.$error"
          :error-message="'Numéro de téléphone non valide'" v-model.trim="customer.contact.phone"
          @focus="saveTmp('contact.phone')" @blur="updateCustomer('contact.phone')" />
        <ni-input caption="Compléments" v-model="customer.contact.others" @blur="updateCustomer('contact.others')"
          @focus="saveTmp('contact.others')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Souscriptions</p>
      <q-card>
        <ni-responsive-table :data="subscriptions" :columns="subscriptionsColumns" :loading="subscriptionsLoading">
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-btn flat dense color="grey" icon="history" @click="showHistory(col.value)" />
                    <q-btn flat dense color="grey" icon="edit" @click="startSubscriptionEdition(col.value)" />
                    <q-btn flat dense color="grey" icon="delete" :disable="props.row.eventCount > 0"
                      @click="validateSubscriptionsDeletion(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <q-btn :disable="serviceOptions.length === 0 || subscriptionsLoading" flat no-caps color="primary" icon="add"
            label="Ajouter une souscription" @click="subscriptionCreationModal = true" />
        </q-card-actions>
      </q-card>
      <template v-if="subscriptions && subscriptions.length > 0">
        <div class="q-mt-md">
          <q-checkbox v-model="customer.subscriptionsAccepted" disable class="q-mr-sm" dense />
          <span style="vertical-align: middle">
            Validation en ligne des souscriptions
            <span class="text-weight-thin text-italic">
              {{ acceptedByHelper }}
            </span>
          </span>
        </div>
      </template>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Aidants</p>
      <q-card>
        <ni-responsive-table :data="sortedHelpers" :columns="helpersColumns" :pagination="helpersPagination"
          :loading="helpersLoading">
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-btn flat dense color="grey" icon="edit" @click="openEditionModalHelper(col.value)" />
                    <q-btn flat dense color="grey" icon="delete" @click="validateHelperDeletion(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <q-btn flat no-caps color="primary" icon="add" label="Ajouter un aidant" @click="openNewHelperModal = true"
            :disable="helpersLoading" />
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Moyen de paiement</p>
      </div>
      <div class="row gutter-profile q-mb-lg">
        <ni-input caption="Nom associé au compte bancaire" :error="$v.customer.payment.bankAccountOwner.$error"
          v-model="customer.payment.bankAccountOwner" @focus="saveTmp('payment.bankAccountOwner')"
          @blur="updateCustomer('payment.bankAccountOwner')" />
        <ni-input caption="IBAN" :error="$v.customer.payment.iban.$error" :error-message="ibanError"
          v-model="customer.payment.iban" @focus="saveTmp('payment.iban')" @blur="updateCustomer('payment.iban')" />
        <ni-input caption="BIC" :error="$v.customer.payment.bic.$error" :error-message="bicError"
          v-model="customer.payment.bic" @focus="saveTmp('payment.bic')" @blur="updateCustomer('payment.bic')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Mandats de prélèvement</p>
      </div>
      <q-card>
        <ni-responsive-table :columns="mandatesColumns" :data="customer.payment.mandates" :pagination.sync="pagination"
          :visible-columns="mandatesVisibleColumns" class="mandate-table" :loading="mandatesLoading">
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'emptyMandate'">
                  <q-btn v-if="customer.payment.mandates && getRowIndex(customer.payment.mandates, props.row) == 0" flat
                    round small color="primary" @click="downloadMandate(props.row)">
                    <q-icon name="file_download" />
                  </q-btn>
                </template>
                <template v-else-if="col.name === 'signedMandate'">
                  <div v-if="!props.row.drive || !getMandateLink(props.row)" class="row justify-center table-actions">
                    <q-uploader flat :url="docsUploadUrl" :headers="headers" :form-fields="mandateFormFields(props.row)"
                      field-name="file" auto-upload :accept="extensions" @uploaded="refreshMandates"
                      @failed="failMsg" />
                  </div>
                  <q-btn v-else flat round small color="primary" type="a" :href="getMandateLink(props.row)"
                    target="_blank" icon="file_download" />
                </template>
                <template v-else-if="col.name === 'signedAt'">
                  <ni-date-input
                    v-model="customer.payment.mandates[getRowIndex(customer.payment.mandates, props.row)].signedAt"
                    @blur="updateSignedAt(props.row)"
                    @focus="saveTmpSignedAt(getRowIndex(customer.payment.mandates, props.row))" in-modal />
                </template>
                <template v-else-if="col.name === 'signed'">
                  <div :class="[{ 'dot dot-active': col.value, 'dot dot-inactive': !col.value }]" />
                </template>
                <template v-else>{{ col.value}}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Financements</p>
      </div>
      <q-card>
        <ni-responsive-table :data="fundings" :columns="fundingsColumns" :visible-columns="fundingsVisibleColumns"
          :loading="fundingsLoading">
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <div class="row no-wrap table-actions">
                    <q-icon color="grey" name="remove_red_eye" @click.native="showFundingDetails(col.value)" />
                    <q-icon color="grey" name="history" @click.native="showFundingHistory(col.value)" />
                    <q-icon color="grey" name="edit" @click.native="startFundingEdition(col.value)" />
                    <q-icon color="grey" name="delete" @click.native="validateFundingDeletion(col.value)" />
                  </div>
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <q-btn :disable="fundingSubscriptionsOptions.length === 0 || fundingsLoading" flat no-caps color="primary" icon="add"
            label="Ajouter un financement" @click="openFundingCreationModal" />
        </q-card-actions>
      </q-card>
    </div>
    <div class="q-mb-lg">
      <p class="text-weight-bold">Justificatifs APA ou autres financements</p>
      <div class="row gutter-profile q-mb-lg">
        <div class="col-xs-12">
          <ni-multiple-files-uploader path="financialCertificates" alt="justificatif financement"
            @uploaded="documentUploaded" name="financialCertificates" collapsibleLabel="Ajouter un justificatif"
            :user-profile="customer" :url="docsUploadUrl" @delete="validateFinancialCertifDeletion($event)"
            additional-fields-name="financialCertificate" :extensions="extensions" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Devis</p>
      </div>
      <q-card>
        <ni-responsive-table :data="customer.quotes" :columns="quotesColumns" :pagination.sync="pagination"
          :visible-columns="quotesVisibleColumns" :loading="quotesLoading">
          <template v-slot:body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'emptyQuote'">
                  <q-icon name="file_download" color="primary" @click="downloadQuote(props.row)" />
                </template>
                <template v-else-if="col.name === 'signedQuote'">
                  <div v-if="!props.row.drive || !getQuoteLink(props.row)" class="row justify-center table-actions">
                    <q-uploader flat :url="docsUploadUrl" :headers="headers" :form-fields="quoteFormFields(props.row)"
                      field-name="file" :accept="extensions" auto-upload @uploaded="refreshQuotes"
                      @failed="failMsg" />
                  </div>
                  <q-btn v-else flat round small color="primary" type="a" :href="getQuoteLink(props.row)"
                    target="_blank" icon="file_download" />
                </template>
                <template v-else-if="col.name === 'signed'">
                  <div :class="[{ 'dot dot-active': col.value, 'dot dot-inactive': !col.value }]" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <q-btn :disable="this.subscriptions.length === 0 || quotesLoading" flat no-caps color="primary" icon="add"
            label="Générer un devis" @click="generateQuote" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Add helper modal -->
    <add-helper-modal v-model="openNewHelperModal" :company="company" :loading="loading" :validations="$v.newHelper"
      :newHelper="newHelper" @submit="submitHelper" @hide="resetAddHelperForm" @nextStep="nextStep"
      :firstStep="firstStep" />

    <!-- Edit helper modal -->
    <edit-helper-modal :editedHelper="editedHelper" v-model="openEditedHelperModal" :loading="loading"
      :validations="$v.editedHelper" @hide="resetEditedHelperForm" @editHelper="editHelper" />

    <!-- Subscription creation modal -->
    <ni-modal v-model="subscriptionCreationModal" @hide="resetCreationSubscriptionData">
      <template slot="title">
        Ajouter une <span class="text-weight-bold">souscription</span>
      </template>
      <ni-select in-modal caption="Service" :options="serviceOptions" v-model="newSubscription.service"
        :error="$v.newSubscription.service.$error" @blur="$v.newSubscription.service.$touch" required-field />
      <ni-input in-modal v-model="newSubscription.unitTTCRate" :error="$v.newSubscription.unitTTCRate.$error"
        caption="Prix unitaire TTC" @blur="$v.newSubscription.unitTTCRate.$touch" type="number" required-field />
      <ni-input in-modal v-model="newSubscription.estimatedWeeklyVolume"
        :error="$v.newSubscription.estimatedWeeklyVolume.$error" caption="Volume hebdomadaire estimatif"
        @blur="$v.newSubscription.estimatedWeeklyVolume.$touch" type="number" required-field />
      <ni-input in-modal v-if="newSubscription.service.nature !== FIXED" v-model="newSubscription.sundays"
        caption="Dont dimanche (h)" type="number" />
      <ni-input in-modal v-if="newSubscription.service.nature !== FIXED" v-model="newSubscription.evenings"
        caption="Dont soirée (h)" last type="number" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter une souscription" icon-right="add" color="primary"
          :loading="loading" @click="submitSubscription" />
      </template>
    </ni-modal>

    <!-- Subscription edition modal -->
    <ni-modal v-model="subscriptionEditionModal" @hide="resetEditionSubscriptionData">
      <template slot="title">
        Editer la <span class="text-weight-bold">souscription</span>
      </template>
      <ni-input in-modal v-model="editedSubscription.unitTTCRate" :error="$v.editedSubscription.unitTTCRate.$error"
        caption="Prix unitaire TTC" @blur="$v.editedSubscription.unitTTCRate.$touch" type="number" required-field />
      <ni-input in-modal v-model="editedSubscription.estimatedWeeklyVolume"
        :error="$v.editedSubscription.estimatedWeeklyVolume.$error" caption="Volume hebdomadaire estimatif"
        @blur="$v.editedSubscription.estimatedWeeklyVolume.$touch" type="number" required-field />
      <ni-input in-modal v-if="editedSubscription.nature !== FIXED" v-model="editedSubscription.sundays"
        caption="Dont dimanche (h)" type="number" />
      <ni-input in-modal v-if="editedSubscription.nature !== FIXED" v-model="editedSubscription.evenings"
        caption="Dont soirée (h)" last type="number" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer la souscription" icon-right="check" color="primary"
          :loading="loading" @click="updateSubscription" />
      </template>
    </ni-modal>

    <!-- Subscription history modal -->
    <ni-modal v-model="subscriptionHistoryModal" @hide="resetSubscriptionHistoryData">
      <template slot="title">
        Historique de la souscription <span class="text-weight-bold">{{selectedSubscription.service &&
                selectedSubscription.service.name}}</span>
      </template>
      <ni-responsive-table class="q-mb-sm" :data="selectedSubscription.versions" :columns="subscriptionHistoryColumns"
        :pagination.sync="paginationHistory">
        <template v-slot:body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-responsive-table>
    </ni-modal>

    <!-- Funding details modal -->
    <ni-modal v-if="Object.keys(selectedFunding).length > 0" v-model="fundingDetailsModal"
      @hide="resetFundingDetailsData">
      <template slot="title">
        Détail du financement <span class="text-weight-bold">{{ selectedFunding.thirdPartyPayer.name }}</span>
      </template>
      <ni-funding-grid-table :data="fundingDetailsData" :columns="fundingsColumns"
        :visible-columns="fundingDetailsVisibleColumns" />
    </ni-modal>

    <!-- Funding history modal -->
    <ni-modal v-if="Object.keys(selectedFunding).length > 0" v-model="fundingHistoryModal"
      @hide="resetFundingHistoryData">
      <template slot="title">
        Historique du financement <span class="text-weight-bold">{{ selectedFunding.thirdPartyPayer.name }}</span>
      </template>
      <ni-funding-grid-table :data="selectedFunding.versions" :columns="fundingsColumns"
        :visible-columns="fundingHistoriesVisibleColumns" />
    </ni-modal>

    <!-- Funding creation modal -->
    <add-funding-modal v-model="fundingCreationModal" :loading="loading" @hide="resetCreationFundingData"
      :newFunding="newFunding" :thirdPartyPayers="ttpList" @submit="submitFunding" :validations="$v.newFunding"
      :fundingSubscriptionsOptions="fundingSubscriptionsOptions" :daysOptions="daysOptions"/>

    <!-- Funding edition modal -->
    <edit-funding-modal v-model="fundingEditionModal" :loading="loading" @hide="resetEditionFundingData"
      :editedFunding="editedFunding" @editFunding="editFunding" :daysOptions="daysOptions"
      :validations="$v.editedFunding" />

  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { mapState } from 'vuex';
import { required, requiredIf } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import pick from 'lodash/pick';
import pickBy from 'lodash/pickBy';
import omit from 'lodash/omit';
import Services from '@api/Services';
import Customers from '@api/Customers';
import ThirdPartyPayers from '@api/ThirdPartyPayers';
import SearchAddress from '@components/form/SearchAddress';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import MultipleFilesUploader from '@components/form/MultipleFilesUploader';
import DateInput from '@components/form/DateInput';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import Modal from '@components/modal/Modal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { downloadDocxFile } from '@helpers/file';
import { frPhoneNumber, iban, bic, frAddress } from '@helpers/vuelidateCustomVal';
import { days } from '@data/days';
import {
  NATURE_OPTIONS,
  FIXED,
  HOURLY,
  MONTHLY,
  REQUIRED_LABEL,
  CIVILITY_OPTIONS,
} from '@data/constants';
import { userMixin } from '@mixins/userMixin';
import FundingGridTable from 'src/modules/client/components/table/FundingGridTable';
import EditHelperModal from 'src/modules/client/components/customers/infos/EditHelperModal';
import AddHelperModal from 'src/modules/client/components/customers/infos/AddHelperModal';
import EditFundingModal from 'src/modules/client/components/customers/infos/EditFundingModal';
import AddFundingModal from 'src/modules/client/components/customers/infos/AddFundingModal';
import { financialCertificatesMixin } from 'src/modules/client/mixins/financialCertificatesMixin';
import { fundingMixin } from 'src/modules/client/mixins/fundingMixin';
import { validationMixin } from 'src/modules/client/mixins/validationMixin';
import { customerMixin } from 'src/modules/client/mixins/customerMixin';
import { subscriptionMixin } from 'src/modules/client/mixins/subscriptionMixin';
import { helperMixin } from 'src/modules/client/mixins/helperMixin';
import { tableMixin } from 'src/modules/client/mixins/tableMixin';

export default {
  name: 'ProfileInfo',
  components: {
    'ni-search-address': SearchAddress,
    'ni-input': Input,
    'ni-select': Select,
    'ni-date-input': DateInput,
    'ni-multiple-files-uploader': MultipleFilesUploader,
    'ni-modal': Modal,
    'add-helper-modal': AddHelperModal,
    'edit-helper-modal': EditHelperModal,
    'add-funding-modal': AddFundingModal,
    'edit-funding-modal': EditFundingModal,
    'ni-responsive-table': ResponsiveTable,
    'ni-funding-grid-table': FundingGridTable,
  },
  mixins: [
    customerMixin,
    subscriptionMixin,
    financialCertificatesMixin,
    fundingMixin,
    validationMixin,
    helperMixin,
    tableMixin,
    userMixin,
  ],
  data () {
    return {
      FIXED,
      days,
      loading: false,
      openEditedHelperModal: false,
      subscriptionCreationModal: false,
      subscriptionEditionModal: false,
      civilityOptions: CIVILITY_OPTIONS,
      isLoaded: false,
      tmpInput: '',
      subscriptions: [],
      selectedSubscription: [],
      services: [],
      quotesVisibleColumns: ['quoteNumber', 'emptyQuote', 'signedQuote', 'signed'],
      quotesColumns: [
        { name: 'quoteNumber', label: 'Numéro du devis', align: 'left', field: 'quoteNumber' },
        { name: 'emptyQuote', label: 'Devis', align: 'center', field: 'emptyQuote' },
        { name: 'signedQuote', label: 'Devis signé', align: 'center', field: 'signedQuote' },
        { name: 'signed', label: 'Signé', align: 'center', field: row => row.drive && row.drive.driveId },
        {
          name: 'createdAt',
          label: '',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
        },
      ],
      quotesLoading: false,
      newSubscription: {
        service: '',
        unitTTCRate: 0,
        estimatedWeeklyVolume: '',
      },
      editedSubscription: {},
      mandatesVisibleColumns: ['rum', 'emptyMandate', 'signedMandate', 'signed', 'signedAt'],
      mandatesColumns: [
        { name: 'rum', label: 'RUM', align: 'left', field: 'rum' },
        { name: 'emptyMandate', label: 'Mandat', align: 'center', field: 'emptyMandate' },
        { name: 'signedMandate', label: 'Mandat signé', align: 'center', field: 'signedMandate' },
        { name: 'signed', label: 'Signé', align: 'center', field: 'signedAt' },
        { name: 'signedAt', label: 'Date de signature', align: 'left', field: 'signedAt' },
        {
          name: 'createdAt',
          label: '',
          field: 'createdAt',
          align: 'left',
          sortable: true,
          format: (value) => this.$moment(value).format('DD/MM/YYYY'),
          sort: (a, b) => (this.$moment(a).toDate()) - (this.$moment(b).toDate()),
        },
      ],
      mandatesLoading: false,
      fundingsVisibleColumns: ['thirdPartyPayer', 'folderNumber', 'nature', 'startDate', 'endDate', 'actions'],
      fundingHistoryModal: false,
      paginationFundingHistory: {
        rowsPerPage: 0,
        sortBy: 'createdAt',
        descending: true,
      },
      ttpList: [],
      newFunding: {
        thirdPartyPayer: '',
        folderNumber: '',
        startDate: '',
        frequency: MONTHLY,
        endDate: '',
        nature: HOURLY,
        amountTTC: 0,
        unitTTCRate: 0,
        careHours: 0,
        customerParticipationRate: 0,
        careDays: [0, 1, 2, 3, 4, 5, 6, 7],
        subscription: '',
      },
      fundingCreationModal: false,
      fundingEditionModal: false,
      fundingDetailsModal: false,
      fundingDetailsData: [],
      editedFunding: {},
      pagination: {
        sortBy: 'createdAt',
        ascending: true,
        rowsPerPage: 0,
      },
      extensions: 'image/jpg, image/jpeg, image/png, application/pdf',
      firstStep: true,
    }
  },
  computed: {
    ...mapState('customer', ['customer']),
    customerIdentity () {
      const firstname = get(this.customer, 'identity.firstname');
      const lastname = get(this.customer, 'identity.lastname');
      return firstname ? `${firstname}_${lastname}` : lastname
    },
    docsUploadUrl () {
      if (!this.customer.driveFolder) return '';

      return `${process.env.API_HOSTNAME}/customers/${this.customer._id}/gdrive/${this.customer.driveFolder.driveId}/upload`;
    },
    headers () {
      return [{ name: 'x-access-token', value: Cookies.get('alenvi_token') || '' }];
    },
    company () {
      return this.$store.getters['main/getCompany'];
    },
    serviceOptions () {
      if (!this.services) return [];

      const subscribedServices = this.subscriptions.map(subscription => get(subscription, 'service._id'));
      const availableServices = this.services.filter(service => !subscribedServices.includes(service._id));

      return availableServices.map(service => ({
        label: this.getServiceLastVersion(service).name,
        value: { _id: service._id, nature: service.nature },
      }));
    },
    primaryAddressError () {
      if (!this.$v.customer.contact.primaryAddress.fullAddress.required) return REQUIRED_LABEL;
      return 'Adresse non valide';
    },
    ibanError () {
      if (!this.$v.customer.payment.iban.required) return REQUIRED_LABEL;
      else if (!this.$v.customer.payment.iban.iban) return 'IBAN non valide';
      return '';
    },
    bicError () {
      if (!this.$v.customer.payment.bic.required) return REQUIRED_LABEL;
      else if (!this.$v.customer.payment.bic.bic) return 'BIC non valide';
      return '';
    },
    acceptedByHelper () {
      if (this.lastSubscriptionHistory && this.customer.subscriptionsAccepted) {
        return `le ${this.$moment(this.lastSubscriptionHistory.approvalDate).format('DD/MM/YYYY')} par ${this.acceptedBy}`;
      }
      return '';
    },
    fundingHistoriesVisibleColumns () {
      return this.selectedFunding.nature === FIXED
        ? ['startDate', 'endDate', 'amountTTC', 'customerParticipationRate', 'careDays']
        : ['startDate', 'endDate', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays'];
    },
    fundingDetailsVisibleColumns () {
      return this.selectedFunding.nature === FIXED
        ? ['frequency', 'amountTTC', 'customerParticipationRate', 'careDays', 'subscription']
        : ['frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays', 'subscription'];
    },
    fundingSubscriptionsOptions () {
      return this.subscriptions
        .filter(sub => get(sub, 'service.nature') !== FIXED)
        .map(sub => ({ label: get(sub, 'service.name'), value: sub._id }));
    },
    daysOptions () {
      return days.map((day, i) => ({ label: day !== 'Jours fériés' ? day.slice(0, 2) : day, value: i }));
    },
  },
  validations () {
    return {
      customer: {
        identity: {
          lastname: { required },
          title: { required },
        },
        contact: {
          phone: { frPhoneNumber },
          primaryAddress: {
            zipCode: { required },
            street: { required },
            city: { required },
            fullAddress: { required, frAddress },
          },
          secondaryAddress: {
            zipCode: { required: requiredIf(item => item && !!item.fullAddress) },
            street: { required: requiredIf(item => item && !!item.fullAddress) },
            city: { required: requiredIf(item => item && !!item.fullAddress) },
            fullAddress: { frAddress },
          },
        },
        payment: {
          bankAccountOwner: { required },
          bic: { required, bic },
          iban: { required, iban },
        },
      },
      newHelper: {
        ...pick(this.userValidation, ['identity.lastname', 'local.email']),
        contact: { phone: { frPhoneNumber } },
      },
      editedHelper: {
        ...pick(this.userValidation, ['identity.lastname', 'local.email']),
        contact: { phone: { frPhoneNumber } },
      },
      newSubscription: {
        service: { required },
        unitTTCRate: { required },
        estimatedWeeklyVolume: { required },
      },
      editedSubscription: {
        unitTTCRate: { required },
        estimatedWeeklyVolume: { required },
      },
      newFunding: {
        thirdPartyPayer: { required },
        subscription: { required },
        nature: { required },
        frequency: { required },
        amountTTC: { required: requiredIf((item) => { return item.nature === FIXED; }) },
        unitTTCRate: { required: requiredIf((item) => { return item.nature === HOURLY }) },
        careHours: { required: requiredIf((item) => { return item.nature === HOURLY; }) },
        careDays: { required },
        startDate: { required },
        customerParticipationRate: { required: requiredIf((item) => { return item.nature === HOURLY; }) },
      },
      editedFunding: {
        amountTTC: { required: requiredIf((item) => { return item.nature === FIXED; }) },
        unitTTCRate: { required: requiredIf((item) => { return item.nature === HOURLY; }) },
        careHours: { required: requiredIf((item) => { return item.nature === HOURLY; }) },
        careDays: { required },
        startDate: { required },
        customerParticipationRate: { required: requiredIf((item) => { return item.nature === HOURLY; }) },
      },
    };
  },
  async mounted () {
    await Promise.all([this.getUserHelpers(), this.refreshCustomer(), this.getServices()]);
    this.isLoaded = true;
  },
  methods: {
    mandateFormFields (row) {
      return [
        { name: 'mandateId', value: row._id },
        { name: 'fileName', value: `mandat_signe_${this.customerIdentity}` },
        { name: 'type', value: 'signedMandate' },
      ]
    },
    quoteFormFields (quote) {
      return [
        { name: 'quoteId', value: quote._id },
        { name: 'fileName', value: `devis_signe_${this.customerIdentity}` },
        { name: 'type', value: 'signedQuote' },
      ]
    },
    getServiceLastVersion (service) {
      if (!service.versions || service.versions.length === 0) return {};

      return service.versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    },
    saveTmp (path) {
      this.tmpInput = get(this.customer, path)
    },
    saveTmpSignedAt (index) {
      this.tmpInput = this.customer.payment.mandates[index].signedAt;
    },
    // Refresh data
    async getServices () {
      try {
        this.services = await Services.list();
      } catch (e) {
        console.error(e);
        this.services = [];
      }
    },
    async refreshMandates () {
      try {
        this.mandatesLoading = true;
        const mandates = await Customers.getMandates(this.customer._id);

        this.$store.dispatch(
          'customer/setCustomer',
          { ...this.customer, payment: { ...this.customer.payment, mandates } }
        );
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      } finally {
        this.mandatesLoading = false;
      }
    },
    async refreshQuotes () {
      try {
        this.quotesLoading = true;
        const quotes = await Customers.getQuotes(this.customer._id);

        this.$store.dispatch('customer/setCustomer', { ...this.customer, quotes });
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      } finally {
        this.quotesLoading = false;
      }
    },
    async refreshCustomer () {
      const customer = await Customers.getById(this.customer._id);
      await this.refreshSubscriptions(customer);
      await this.refreshFundings(customer);

      this.$store.dispatch(
        'customer/setCustomer',
        { ...customer, subscriptions: [...this.subscriptions], fundings: [...this.fundings] }
      );
      this.$v.customer.$touch();
    },
    // Subscriptions
    formatCreatedSubscription () {
      const { service, unitTTCRate, estimatedWeeklyVolume, sundays, evenings } = this.newSubscription;
      const formattedService = { service: service._id, versions: [{ unitTTCRate, estimatedWeeklyVolume }] }

      if (sundays) formattedService.versions[0].sundays = sundays;
      if (evenings) formattedService.versions[0].evenings = evenings;

      return formattedService;
    },
    resetCreationSubscriptionData () {
      this.$v.newSubscription.$reset();
      this.newSubscription = {
        service: '',
        unitTTCRate: 0,
        estimatedWeeklyVolume: '',
      };
    },
    async submitSubscription () {
      try {
        this.$v.newSubscription.$touch();
        if (this.$v.newSubscription.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedSubscription();
        await Customers.addSubscription(this.customer._id, payload);
        await this.refreshCustomer();
        this.subscriptionCreationModal = false;
        NotifyPositive('Souscription ajoutée');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de la souscription.');
      } finally {
        this.loading = false;
      }
    },
    startSubscriptionEdition (id) {
      const selectedSubscription = this.subscriptions.find(sub => sub._id === id);
      const { _id, service, unitTTCRate, estimatedWeeklyVolume, evenings, sundays } = selectedSubscription;
      this.editedSubscription = {
        _id,
        nature: service.nature,
        unitTTCRate,
        estimatedWeeklyVolume,
        evenings,
        sundays,
      };

      this.subscriptionEditionModal = true;
    },
    resetEditionSubscriptionData () {
      this.editedSubscription = {};
      this.$v.editedSubscription.$reset();
    },
    async updateSubscription () {
      try {
        this.$v.editedSubscription.$touch();
        if (this.$v.editedSubscription.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const subscriptionId = this.editedSubscription._id;
        const payload = omit(pickBy(this.editedSubscription), ['_id', 'nature']);
        await Customers.updateSubscription({ _id: this.customer._id, subscriptionId }, payload);

        this.refreshCustomer();
        this.subscriptionEditionModal = false;
        NotifyPositive('Souscription modifiée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de la souscription.')
      } finally {
        this.loading = false;
      }
    },
    async deleteSubscriptions (subscriptionId) {
      try {
        await Customers.removeSubscription({ subscriptionId, _id: this.customer._id });
        await this.refreshCustomer();
        NotifyPositive('Souscription supprimée');
      } catch (e) {
        console.error(e);
        if (e.status === 403) return NotifyNegative(e.data.message);
        return NotifyNegative('Erreur lors de la suppression de la souscription.')
      }
    },
    validateSubscriptionsDeletion (subscriptionId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer cette souscription ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteSubscriptions(subscriptionId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    // Mandates
    getMandateLink (mandate) {
      return get(mandate, 'drive.link') || false;
    },
    async updateSignedAt (mandate) {
      try {
        if (!mandate.signedAt || this.tmpInput === mandate.signedAt) return;
        const params = { _id: this.customer._id, mandateId: mandate._id };
        await Customers.updateMandate(params, mandate);

        this.refreshMandates();
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification.');
      }
    },
    async downloadMandate (doc) {
      try {
        const mandateDriveId = get(this.company, 'customersConfig.templates.debitMandate.driveId', null);
        if (!mandateDriveId) {
          return NotifyWarning('Template manquant');
        }

        const data = {
          bankAccountOwner: this.customer.payment.bankAccountOwner || '',
          customerAddress: this.customer.contact.primaryAddress.fullAddress,
          downloadDate: this.$moment(Date.now()).format('DD/MM/YYYY'),
          ics: this.company.ics,
          rum: doc.rum,
          bic: this.customer.payment.bic || '',
          iban: this.customer.payment.iban || '',
          companyName: this.company.name,
          companyAddress: this.company.address.fullAddress,
        };
        const params = { driveId: mandateDriveId };

        await downloadDocxFile(params, data, 'mandat.docx');
        NotifyPositive('Mandat téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement du mandat.');
      }
    },
    // Documents
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document.');
    },
    // Quotes
    getQuoteLink (quote) {
      return get(quote, 'drive.link') || false;
    },
    formatSubscriptionToDownloadQuote (subscription) {
      const estimatedWeeklyRate = this.computeWeeklyRate(subscription);
      const nature = NATURE_OPTIONS.find(nat => nat.value === subscription.service.nature);

      return {
        serviceName: subscription.service.name,
        serviceNature: nature ? nature.label : '',
        unitTTCRate: subscription.unitTTCRate ? `${this.formatNumber(subscription.unitTTCRate)}€` : '',
        weeklyVolume: subscription.estimatedWeeklyVolume,
        weeklyRate: estimatedWeeklyRate ? `${this.formatNumber(estimatedWeeklyRate)}€` : '',
        sundays: subscription.sundays || '',
        evenings: subscription.evenings || '',
      }
    },
    async downloadQuote (doc) {
      try {
        const quoteDriveId = get(this.company, 'customersConfig.templates.quote.driveId', null);
        if (!quoteDriveId) return NotifyWarning('Template manquant');

        const subscriptions = this.subscriptions.map(this.formatSubscriptionToDownloadQuote);

        const data = {
          quoteNumber: doc.quoteNumber,
          customerFirstname: this.customer.identity.firstname,
          customerLastname: this.customer.identity.lastname,
          customerAddress: this.customer.contact.primaryAddress.fullAddress,
          companyName: this.company.name,
          companyAddress: this.company.address.fullAddress,
          rcs: this.company.rcs,
          subscriptions,
          downloadDate: this.$moment(Date.now()).format('DD/MM/YYYY'),
        }
        const params = { driveId: quoteDriveId };
        await downloadDocxFile(params, data, 'devis.docx');
        NotifyPositive('Devis téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement du devis.');
      }
    },
    formatSubscriptionToGenerateQuote (subscription) {
      const sub = {
        serviceName: subscription.service.name,
        unitTTCRate: subscription.unitTTCRate,
        estimatedWeeklyVolume: subscription.estimatedWeeklyVolume,
      }
      if (subscription.sundays) sub.sundays = subscription.sundays;
      if (subscription.evenings) sub.evenings = subscription.evenings;

      return sub;
    },
    async generateQuote () {
      try {
        const subscriptions = this.subscriptions.map(this.formatSubscriptionToGenerateQuote);
        const payload = { subscriptions };
        await Customers.addQuote(this.customer._id, payload);

        await this.refreshQuotes();
        NotifyPositive('Devis généré');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la génération du devis.');
      }
    },
    // Fundings
    async getThirdPartyPayers () {
      try {
        this.ttpList = await ThirdPartyPayers.list();
      } catch (e) {
        this.ttpList = [];
        console.error(e);
      }
    },
    async openFundingCreationModal () {
      await this.getThirdPartyPayers();
      this.fundingCreationModal = true;
    },
    showFundingHistory (id) {
      this.selectedFunding = this.fundings.find(sub => sub._id === id);
      this.fundingHistoryModal = true;
    },
    resetFundingHistoryData () {
      this.fundingHistoryModal = false;
      this.selectedFunding = {};
    },
    resetCreationFundingData () {
      this.fundingCreationModal = false;
      this.$v.newFunding.$reset();
      this.newFunding = {
        thirdPartyPayer: '',
        folderNumber: '',
        startDate: '',
        frequency: MONTHLY,
        endDate: '',
        nature: HOURLY,
        amountTTC: 0,
        unitTTCRate: 0,
        careHours: 0,
        customerParticipationRate: 0,
        careDays: [0, 1, 2, 3, 4, 5, 6, 7],
        subscription: '',
      };
    },
    formatCreatedFunding () {
      const cleanPayload = pickBy(this.newFunding);
      const { nature, thirdPartyPayer, subscription, frequency, ...version } = cleanPayload;
      if (version.endDate) version.endDate = this.$moment(version.endDate).endOf('d').toDate();

      return { nature, thirdPartyPayer, subscription, frequency, versions: [{ ...version }] };
    },
    async submitFunding () {
      try {
        this.$v.newFunding.$touch();
        if (this.$v.newFunding.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedFunding();
        await Customers.addFunding(this.customer._id, payload);

        this.resetCreationFundingData();
        await this.refreshCustomer();
        NotifyPositive('Financement ajoutée');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative("Erreur lors de l'ajout d'un financement");
      } finally {
        this.loading = false;
      }
    },
    async deleteFunding (fundingId) {
      try {
        const params = { fundingId, _id: this.customer._id };
        await Customers.removeFunding(params);
        await this.refreshCustomer();
        NotifyPositive('Financement supprimé');
      } catch (e) {
        console.error(e);
      }
    },
    validateFundingDeletion (fundingId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer ce financement ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteFunding(fundingId))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    showFundingDetails (id) {
      this.selectedFunding = this.fundings.find(sub => sub._id === id);
      this.fundingDetailsData.push(this.selectedFunding);
      this.fundingDetailsModal = true;
    },
    resetFundingDetailsData () {
      this.fundingDetailsModal = false;
      this.selectedFunding = {};
      this.fundingDetailsData = []
    },
    startFundingEdition (id) {
      this.editedFunding = Object.assign({}, this.fundings.find(fund => fund._id === id));
      this.editedFunding.subscription = this.editedFunding.subscription._id;
      this.fundingEditionModal = true;
    },
    resetEditionFundingData () {
      this.fundingEditionModal = false;
      this.editedFunding = {};
      this.$v.editedFunding.$reset();
    },
    formatFundingEditionPayload (funding) {
      const pickedFields = ['folderNumber', 'careDays', 'customerParticipationRate', 'startDate', 'subscription'];
      if (funding.nature === FIXED) pickedFields.push('amountTTC');
      else if (funding.nature === HOURLY) pickedFields.push('unitTTCRate', 'careHours');
      const payload = {
        ...pick(funding, pickedFields),
        endDate: funding.endDate ? this.$moment(funding.endDate).endOf('d') : '',
      };

      return pickBy(payload);
    },
    async editFunding () {
      try {
        this.$v.editedFunding.$touch();
        if (this.$v.editedFunding.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;

        const payload = this.formatFundingEditionPayload(this.editedFunding);
        await Customers.updateFunding({ _id: this.customer._id, fundingId: this.editedFunding._id }, payload);

        this.resetEditionFundingData();
        await this.refreshCustomer();
        NotifyPositive('Financement modifié');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative("Erreur lors de la modification d'un financement");
      } finally {
        this.loading = false;
      }
    },
  },
}
</script>

<style lang="stylus" scoped>
  .table-actions > .q-btn__wrapper
    padding: 0

  a
    color: $primary
    text-decoration: none

  .mandate-table
    td
      word-break: break-all

  .dot-inactive
    background: $secondary

  @media screen and (min-width: 768px)
    .dot
      margin: 0px

  .signedAt
    /deep/ .q-field--with-bottom
      padding: 0
    /deep/ .q-field__bottom
      display: none
</style>
