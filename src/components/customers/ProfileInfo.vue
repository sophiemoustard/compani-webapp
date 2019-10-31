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
          :options="civilityOptions" @focus="saveTmp('identity.title')" @blur="updateCustomer('identity.title')" />
        <ni-date-input v-model="customer.identity.birthDate" @focus="saveTmp('identity.birthDate')"
          caption="Date de naissance" @blur="updateCustomer('identity.birthDate')" content-class="col-xs-12 col-md-6" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Contact</p>
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Téléphone" type="tel" :error="$v.customer.contact.phone.$error"
          :error-label="'Numéro de téléphone non valide'" v-model.trim="customer.contact.phone"
          @focus="saveTmp('contact.phone')" @blur="updateCustomer('contact.phone')" />
        <ni-search-address v-model="customer.contact.primaryAddress" :error-label="primaryAddressError"
          :error="$v.customer.contact.primaryAddress.$error" caption="Adresse principale"
          @focus="saveTmp('contact.primaryAddress.fullAddress')" @blur="updateCustomer('contact.primaryAddress')" />
        <ni-search-address v-model="customer.contact.secondaryAddress" caption="Adresse secondaire"
          error-label="Adresse non valide" :error="$v.customer.contact.secondaryAddress.$error"
          @focus="saveTmp('contact.secondaryAddress.fullAddress')" @blur="updateCustomer('contact.secondaryAddress')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Souscriptions</p>
      <q-card>
        <q-table :data="subscriptions" :columns="subscriptionsColumns" row-key="name" hide-bottom
          class="table-responsive">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <q-icon color="grey" name="history" @click="showHistory(col.value)" />
                  <q-icon color="grey" name="edit" @click="startSubscriptionEdition(col.value)" />
                  <q-icon color="grey" name="delete" :disable="props.row.eventCount > 0"
                    @click="removeSubscriptions(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
        <q-card-actions align="right">
          <q-btn :disable="serviceOptions.length === 0" flat no-caps color="primary" icon="add"
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
        <q-table :data="sortedHelpers" :columns="helperColumns" row-key="name" hide-bottom
          class="table-responsive" :pagination="helperPagination">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <q-icon color="grey" name="edit" @click="openEditionModalHelper(col.value)" />
                  <q-icon color="grey" name="delete" @click.native="removeHelper(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
        <q-card-actions align="right">
          <q-btn flat no-caps color="primary" icon="add" label="Ajouter un aidant" @click="openNewHelperModal = true" />
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
        <ni-input caption="IBAN" :error="$v.customer.payment.iban.$error" :error-label="ibanError"
          v-model="customer.payment.iban" @focus="saveTmp('payment.iban')" @blur="updateCustomer('payment.iban')" />
        <ni-input caption="BIC" :error="$v.customer.payment.bic.$error" :error-label="bicError"
          v-model="customer.payment.bic" @focus="saveTmp('payment.bic')" @blur="updateCustomer('payment.bic')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Mandats de prélèvement</p>
      </div>
      <q-card>
        <q-table :columns="mandateColumns" :data="customer.payment.mandates" hide-bottom :pagination.sync="pagination"
          :visible-columns="visibleMandateColumns" binary-state-sort class="table-responsive mandate-table">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
              <template v-if="col.name === 'emptyMandate'">
                <q-btn v-if="customer.payment.mandates && props.row.__index == 0" flat round small color="primary"
                  @click="downloadMandate(props.row)">
                  <q-icon name="file_download" />
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signedMandate'">
                <div v-if="!props.row.drive || !props.row.drive.link" class="row justify-center table-actions">
                  <q-uploader flat :url="docsUploadUrl" :headers="headers" :form-fields="mandateFormFields(props.row)"
                    field-name="signedMandate" auto-upload :accept="extensions" @uploaded="refreshMandates"
                    @failed="failMsg" />
                </div>
                <q-btn v-else flat round small color="primary">
                  <a :href="props.row.drive.link" download target="_blank">
                    <q-icon name="file_download" />
                  </a>
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signedAt'">
                <ni-date-input v-model="customer.payment.mandates[props.row.__index].signedAt"
                  @blur="updateSignedAt(props.row)" @focus="saveTmpSignedAt(props.row.__index)" in-modal />
              </template>
              <template v-else-if="col.name === 'signed'">
                <div :class="[{ activeDot: col.value, inactiveDot: !col.value }]" />
              </template>
              <template v-else>{{ col.value}}</template>
            </q-td>
          </q-tr>
        </q-table>
      </q-card>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Financements</p>
      </div>
      <q-card>
        <q-table :data="fundings" :columns="fundingColumns" :visible-columns="fundingVisibleColumns"
          :rows-per-page-options="[0]" row-key="name" table-style="font-size: 1rem" hide-bottom
          class="table-responsive">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <q-icon color="grey" name="remove_red_eye"
                    @click.native="showFundingDetails(col.value)" />
                  <q-icon color="grey" name="history" @click.native="showFundingHistory(col.value)" />
                  <q-icon color="grey" name="edit" @click.native="startFundingEdition(col.value)" />
                  <q-icon color="grey" name="delete" @click.native="removeFunding(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
        <q-card-actions align="right">
          <q-btn :disable="fundingSubscriptionsOptions().length === 0" flat no-caps color="primary" icon="add"
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
            :user-profile="customer" :url="docsUploadUrl" @delete="deleteDocument($event)"
            additional-fields-name="financialCertificate" />
          </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Devis</p>
      </div>
      <q-card>
        <q-table :data="customer.quotes" :columns="quoteColumns" row-key="name" table-style="font-size: 1rem"
          hide-bottom :pagination.sync="pagination" :visible-columns="visibleQuoteColumns" binary-state-sort
          class="table-responsive">
          <q-tr slot="body" slot-scope="props" :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
              <template v-if="col.name === 'emptyQuote'">
                <q-icon name="file_download" color="primary" @click="downloadQuote(props.row)" />
              </template>
              <template v-else-if="col.name === 'signedQuote'">
                <div v-if="!props.row.drive || !props.row.drive.link" class="row justify-center table-actions">
                  <q-uploader flat :url="docsUploadUrl" :headers="headers" :form-fields="quoteFormFields(props.row)"
                    field-name="signedQuote" :accept="extensions" auto-upload @uploaded="refreshQuotes"
                    @failed="failMsg" />
                </div>
                <q-btn v-else flat round small color="primary">
                  <a :href="props.row.drive.link" download target="_blank">
                    <q-icon name="file_download" />
                  </a>
                </q-btn>
              </template>
              <template v-else-if="col.name === 'signed'">
                <div :class="[{ activeDot: col.value, inactiveDot: !col.value }]" />
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </q-table>
        <q-card-actions align="right">
          <q-btn :disabled="this.subscriptions.length === 0" flat no-caps color="primary" icon="add"
            label="Générer un devis" @click="generateQuote" />
        </q-card-actions>
      </q-card>
    </div>

    <!-- Add helper modal -->
    <add-helper-modal v-model="openNewHelperModal" :company="company" :loading="loading"
      :validations="$v.newHelper" :newHelper="newHelper" @submit="submitHelper" @hide="resetAddHelperForm"/>

    <!-- Edit helper modal -->
    <edit-helper-modal :editedHelper="editedHelper" v-model="openEditedHelperModal" :loading="loading"
      :validations="$v.editedHelper" @hide="resetEditedHelperForm" @editHelper="editHelper"/>

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
      <q-table class="q-mb-xl table-responsive" :data="selectedSubscription.versions" flat
        :columns="subscriptionHistoryColumns" hide-bottom binary-state-sort :pagination.sync="paginationHistory">
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
            <template>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </q-table>
    </ni-modal>

    <!-- Funding details modal -->
    <ni-modal v-if="Object.keys(selectedFunding).length > 0" v-model="fundingDetailsModal"
      @hide="resetFundingDetailsData">
      <template slot="title">
        Détail du financement <span class="text-weight-bold">{{ selectedFunding.thirdPartyPayer.name }}</span>
      </template>
      <q-table class="q-mb-xl table-grid" :data="fundingDetailsData" :columns="fundingColumns" hide-bottom flat
        binary-state-sort :visible-columns="fundingDetailsVisibleColumns" :rows-per-page-options="[0]">
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
            <template>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </q-table>
    </ni-modal>

    <!-- Funding history modal -->
    <ni-modal v-if="Object.keys(selectedFunding).length > 0" v-model="fundingHistoryModal"
      @hide="resetFundingHistoryData">
      <template slot="title">
        Historique du financement <span class="text-weight-bold">{{ selectedFunding.thirdPartyPayer.name }}</span>
      </template>
      <q-table class="q-mb-xl table-grid" :data="selectedFunding.versions" :columns="fundingColumns" hide-bottom flat
        binary-state-sort :pagination.sync="paginationFundingHistory" :visible-columns="fundingHistoryVisibleColumns">
        <q-tr slot="body" slot-scope="props" :props="props">
          <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props">
            <template>{{ col.value }}</template>
          </q-td>
        </q-tr>
      </q-table>
    </ni-modal>

    <!-- Funding creation modal -->
    <ni-modal v-model="fundingCreationModal" @hide="resetCreationFundingData">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">financement</span>
      </template>
      <ni-select in-modal caption="Tiers payeur" :options="fundingTppOptions" v-model="newFunding.thirdPartyPayer"
        :error="$v.newFunding.thirdPartyPayer.$error" @blur="$v.newFunding.thirdPartyPayer.$touch" required-field />
      <ni-select in-modal v-model="newFunding.subscription" :options="fundingSubscriptionsOptions()"
        caption="Souscription" @blur="$v.newFunding.subscription.$touch" :error="$v.newFunding.subscription.$error"
        required-field />
      <ni-date-input v-model="newFunding.startDate" caption="Date de début de prise en charge" in-modal
        @blur="$v.newFunding.startDate.$touch" :error="$v.newFunding.startDate.$error" required-field />
      <ni-date-input v-model="newFunding.endDate" :min="$moment(newFunding.startDate).add(1, 'day').toISOString()"
        in-modal caption="Date de fin de prise en charge" />
      <ni-input in-modal v-model="newFunding.folderNumber" caption="Numéro de dossier" />
      <ni-select in-modal caption="Fréquence" :options="fundingFreqOptions" v-model="newFunding.frequency"
        @blur="$v.newFunding.frequency.$touch" :error="$v.newFunding.frequency.$error" required-field />
      <ni-select in-modal caption="Nature" :options="fundingNatureOptions" v-model="newFunding.nature"
        :error="$v.newFunding.nature.$error" @blur="$v.newFunding.nature.$touch" required-field
        @input="resetFundingFrequency" />
      <ni-input in-modal v-if="!isOneTimeFundingNature" v-model="newFunding.unitTTCRate" caption="Prix unitaire TTC"
        type="number" @blur="$v.newFunding.unitTTCRate.$touch" :error="$v.newFunding.unitTTCRate.$error"
        required-field />
      <ni-input in-modal v-if="isOneTimeFundingNature" v-model="newFunding.amountTTC" caption="Montant forfaitaire TTC"
        type="number" @blur="$v.newFunding.amountTTC.$touch" :error="$v.newFunding.amountTTC.$error" required-field />
      <ni-input in-modal v-if="!isOneTimeFundingNature" v-model="newFunding.careHours"
        caption="Nb. heures prises en charge" type="number" suffix="h" @blur="$v.newFunding.careHours.$touch"
        :error="$v.newFunding.careHours.$error" required-field />
      <ni-input in-modal v-if="!isOneTimeFundingNature" v-model="newFunding.customerParticipationRate"
        caption="Taux de participation du bénéficiaire" type="number" suffix="%"
        @blur="$v.newFunding.customerParticipationRate.$touch" :error="$v.newFunding.customerParticipationRate.$error"
        required-field />
      <ni-option-group v-model="newFunding.careDays" :options="daysOptions" caption="Jours pris en charge"
        type="checkbox" inline @blur="$v.newFunding.careDays.$touch" :error="$v.newFunding.careDays.$error"
        required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un financement" icon-right="add" color="primary"
          :loading="loading" @click="submitFunding" />
      </template>
    </ni-modal>

    <!-- Funding edition modal -->
    <ni-modal v-if="Object.keys(editedFunding).length > 0" v-model="fundingEditionModal"
      @hide="resetEditionFundingData">
      <template slot="title">
        Modifier le <span class="text-weight-bold">financement</span>
      </template>
      <ni-date-input v-model="editedFunding.startDate" caption="Date de début de prise en charge"
        :max="editedFundingMaxStartDate" class="last" in-modal @blur="$v.editedFunding.startDate.$touch"
        :error="$v.editedFunding.startDate.$error" required-field />
      <ni-date-input v-model="editedFunding.endDate" caption="Date de fin de prise en charge" in-modal
        :min="$moment(editedFunding.startDate).add(1, 'day').toISOString()" />
      <ni-input in-modal v-model="editedFunding.folderNumber" caption="Numéro de dossier" />
      <ni-select in-modal caption="Fréquence" :options="fundingFreqOptions" v-model="editedFunding.frequency"
        @blur="$v.editedFunding.frequency.$touch" :error="$v.editedFunding.frequency.$error" required-field />
      <ni-input in-modal v-if="!isOneTimeEditedFundingNature" v-model="editedFunding.unitTTCRate"
        caption="Prix unitaire TTC" type="number" @blur="$v.editedFunding.unitTTCRate.$touch"
        :error="$v.editedFunding.unitTTCRate.$error" required-field />
      <ni-input in-modal v-if="isOneTimeEditedFundingNature" v-model="editedFunding.amountTTC"
        caption="Montant forfaitaire TTC" type="number" @blur="$v.editedFunding.amountTTC.$touch"
        :error="$v.editedFunding.amountTTC.$error" required-field />
      <ni-input in-modal v-if="!isOneTimeEditedFundingNature" v-model="editedFunding.careHours"
        caption="Nb. heures prises en charge" type="number" @blur="$v.editedFunding.careHours.$touch"
        :error="$v.editedFunding.careHours.$error" required-field suffix="h" />
      <ni-input in-modal v-if="!isOneTimeEditedFundingNature" v-model="editedFunding.customerParticipationRate"
        caption="Taux de participation du bénéficiaire" type="number" suffix="%"
        @blur="$v.editedFunding.customerParticipationRate.$touch"
        :error="$v.editedFunding.customerParticipationRate.$error" required-field />
      <ni-option-group v-model="editedFunding.careDays" :options="daysOptions" caption="Jours pris en charge"
        type="checkbox" inline @blur="$v.editedFunding.careDays.$touch" :error="$v.editedFunding.careDays.$error"
        required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Modifier le financement" icon-right="check" color="primary"
          :loading="loading" @click="editFunding" />
      </template>
    </ni-modal>
  </div>
</template>

<script>
import { Cookies } from 'quasar';
import { required, requiredIf, email } from 'vuelidate/lib/validators';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '../../components/popup/notify.js';
import SearchAddress from '../form/SearchAddress';
import Input from '../form/Input';
import AddHelperModal from './AddHelperModal.vue';
import EditHelperModal from './EditHelperModal.vue';
import Select from '../form/Select';
import OptionGroup from '../form/OptionGroup';
import MultipleFilesUploader from '../form/MultipleFilesUploader.vue';
import DateInput from '../form/DateInput';
import Modal from '../Modal';
import { downloadDocxFile } from '../../helpers/downloadFile';
import { customerMixin } from '../../mixins/customerMixin.js';
import { subscriptionMixin } from '../../mixins/subscriptionMixin.js';
import { days } from '../../data/days.js';
import {
  FUNDING_FREQ_OPTIONS,
  NATURE_OPTIONS,
  FIXED,
  HOURLY,
  REQUIRED_LABEL,
  ONCE,
  CIVILITY_OPTIONS,
} from '../../data/constants.js';
import { financialCertificatesMixin } from '../../mixins/financialCertificatesMixin.js';
import { fundingMixin } from '../../mixins/fundingMixin.js';
import { validationMixin } from '../../mixins/validationMixin.js';
import { helperMixin } from '../../mixins/helperMixin.js';
import { frPhoneNumber, iban, bic, frAddress } from '../../helpers/vuelidateCustomVal';

export default {
  name: 'ProfileInfo',
  components: {
    NiSearchAddress: SearchAddress,
    'ni-input': Input,
    'ni-select': Select,
    'ni-date-input': DateInput,
    'ni-option-group': OptionGroup,
    'ni-multiple-files-uploader': MultipleFilesUploader,
    'ni-modal': Modal,
    'add-helper-modal': AddHelperModal,
    'edit-helper-modal': EditHelperModal,
  },
  mixins: [
    customerMixin,
    subscriptionMixin,
    financialCertificatesMixin,
    fundingMixin,
    validationMixin,
    helperMixin,
  ],
  data () {
    return {
      FIXED,
      days,
      loading: false,
      openNewHelperModal: false,
      openEditedHelperModal: false,
      subscriptionCreationModal: false,
      subscriptionEditionModal: false,
      civilityOptions: CIVILITY_OPTIONS,
      isLoaded: false,
      tmpInput: '',
      customer: {
        identity: {},
        contact: {
          primaryAddress: {},
          secondaryAddress: {},
        },
        payment: {
          mandates: [],
        },
        subscriptions: [],
        quotes: [],
        financialCertificates: [],
      },
      subscriptions: [],
      selectedSubscription: [],
      services: [],
      quoteColumns: [
        {
          name: 'quoteNumber',
          label: 'Numéro du devis',
          align: 'left',
          field: 'quoteNumber',
        },
        {
          name: 'emptyQuote',
          label: 'Devis',
          align: 'center',
          field: 'emptyQuote',
        },
        {
          name: 'signedQuote',
          label: 'Devis signé',
          align: 'center',
          field: 'signedQuote',
        },
        {
          name: 'signed',
          label: 'Signé',
          align: 'center',
          field: row => row.drive && row.drive.driveId,
        },
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
      newSubscription: {
        service: '',
        unitTTCRate: '',
        estimatedWeeklyVolume: '',
      },
      editedSubscription: {},
      visibleMandateColumns: ['rum', 'emptyMandate', 'signedMandate', 'signed', 'signedAt'],
      visibleQuoteColumns: ['quoteNumber', 'emptyQuote', 'signedQuote', 'signed'],
      mandateColumns: [
        {
          name: 'rum',
          label: 'RUM',
          align: 'left',
          field: 'rum',
        },
        {
          name: 'emptyMandate',
          label: 'Mandat',
          align: 'center',
          field: 'emptyMandate',
        },
        {
          name: 'signedMandate',
          label: 'Mandat signé',
          align: 'center',
          field: 'signedMandate',
        },
        {
          name: 'signed',
          label: 'Signé',
          align: 'center',
          field: 'signedAt',
        },
        {
          name: 'signedAt',
          label: 'Date de signature',
          align: 'left',
          field: 'signedAt',
        },
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
      fundingVisibleColumns: ['thirdPartyPayer', 'folderNumber', 'nature', 'startDate', 'endDate', 'actions'],
      fundingHistoryModal: false,
      paginationFundingHistory: {
        rowsPerPage: 0,
        sortBy: 'createdAt',
        descending: true,
      },
      fundingTppOptions: [],
      newFunding: {
        thirdPartyPayer: '',
        folderNumber: '',
        startDate: '',
        frequency: '',
        endDate: '',
        nature: '',
        amountTTC: '',
        unitTTCRate: '',
        customerParticipationRate: 0,
        careDays: [0, 1, 2, 3, 4, 5, 6, 7],
        subscription: '',
      },
      fundingNatureOptions: NATURE_OPTIONS,
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
      extensions: 'image/jpg, image/jpeg, image/gif, image/png, application/pdf',
    }
  },
  computed: {
    docsUploadUrl () {
      if (!this.customer.driveFolder) return '';

      return `${process.env.API_HOSTNAME}/customers/${this.customer._id}/gdrive/${this.customer.driveFolder.driveId}/upload`;
    },
    headers () {
      return [{ name: 'x-access-token', value: Cookies.get('alenvi_token') || '' }];
    },
    company () {
      return this.$store.getters['main/company'];
    },
    serviceOptions () {
      if (!this.services) return [];

      const subscribedServices = this.subscriptions.map(subscription => subscription.service._id);
      const availableServices = this.services.filter(service => !subscribedServices.includes(service._id));

      return availableServices.map(service => ({
        label: this.getServiceLastVersion(service).name,
        value: { _id: service._id, nature: service.nature },
      }));
    },
    userProfile () {
      return this.$store.getters['rh/getUserProfile'];
    },
    primaryAddressError () {
      if (!this.$v.customer.contact.primaryAddress.fullAddress.required) {
        return REQUIRED_LABEL;
      }
      return 'Adresse non valide';
    },
    ibanError () {
      if (!this.$v.customer.payment.iban.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.customer.payment.iban.iban) {
        return 'IBAN non valide';
      }
      return '';
    },
    bicError () {
      if (!this.$v.customer.payment.bic.required) {
        return REQUIRED_LABEL;
      } else if (!this.$v.customer.payment.bic.bic) {
        return 'BIC non valide';
      }
      return '';
    },
    acceptedByHelper () {
      if (this.lastSubscriptionHistory && this.customer.subscriptionsAccepted) {
        return `le ${this.$moment(this.lastSubscriptionHistory.approvalDate).format('DD/MM/YYYY')} par ${this.acceptedBy}`;
      }
      return '';
    },
    fundingHistoryVisibleColumns () {
      if (this.selectedFunding.nature === FIXED) {
        return ['startDate', 'endDate', 'frequency', 'amountTTC', 'customerParticipationRate', 'careDays'];
      }
      return ['startDate', 'endDate', 'frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays'];
    },
    fundingDetailsVisibleColumns () {
      if (this.selectedFunding.nature === FIXED) {
        return ['frequency', 'amountTTC', 'customerParticipationRate', 'careDays', 'subscription'];
      }
      return ['frequency', 'unitTTCRate', 'careHours', 'customerParticipationRate', 'careDays', 'subscription'];
    },
    isOneTimeFundingNature () {
      return this.newFunding.nature === FIXED;
    },
    isOneTimeEditedFundingNature () {
      return this.editedFunding.nature === FIXED;
    },
    fundingFreqOptions () {
      if ((this.fundingCreationModal && this.newFunding.nature === FIXED) ||
        (this.fundingEditionModal && this.editedFunding.nature === FIXED)) {
        return FUNDING_FREQ_OPTIONS.filter(option => option.value === ONCE);
      }

      return FUNDING_FREQ_OPTIONS;
    },
    daysOptions () {
      return days.map((day, i) => ({
        label: day !== 'Jours fériés' ? day.slice(0, 2) : day,
        value: i,
      }));
    },
    editedFundingMaxStartDate () {
      if (this.editedFunding && this.editedFunding.endDate) {
        return this.$moment(this.editedFunding.endDate).subtract(1, 'day').toISOString();
      }
      return '';
    },
  },
  validations: {
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
      identity: { lastname: { required } },
      local: {
        email: { required, email },
      },
      contact: {
        phone: { frPhoneNumber },
      },
    },
    editedHelper: {
      identity: { lastname: { required } },
      local: {
        email: { required, email },
      },
      contact: {
        phone: { frPhoneNumber },
      },
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
      amountTTC: { required: requiredIf((item) => {
        return item.nature === FIXED;
      }) },
      unitTTCRate: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
      careHours: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
      careDays: { required },
      startDate: { required },
      customerParticipationRate: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
    },
    editedFunding: {
      frequency: { required },
      amountTTC: { required: requiredIf((item) => {
        return item.nature === FIXED;
      }) },
      unitTTCRate: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
      careHours: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
      careDays: { required },
      startDate: { required },
      customerParticipationRate: { required: requiredIf((item) => {
        return item.nature === HOURLY;
      }) },
    },
  },
  async mounted () {
    await this.getUserHelpers();
    await this.refreshCustomer();
    await this.getServices();
    this.isLoaded = true;
  },
  methods: {
    mandateFormFields (row) {
      return [
        { name: 'mandateId', value: row._id },
        {
          name: 'fileName',
          value: `mandat_signe_${this.customer.identity.firstname}_${this.customer.identity.lastname}`,
        },
      ]
    },
    quoteFormFields (quote) {
      return [
        { name: 'quoteId', value: quote._id },
        { name: 'fileName', value: `devis_signe_${this.customer.identity.firstname}_${this.customer.identity.lastname}` },
      ]
    },
    getServiceLastVersion (service) {
      if (!service.versions || service.versions.length === 0) return {};

      return service.versions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))[0];
    },
    saveTmp (path) {
      this.tmpInput = this.$_.get(this.customer, path)
    },
    saveTmpSignedAt (index) {
      this.tmpInput = this.customer.payment.mandates[index].signedAt;
    },
    // Refresh data
    async getServices () {
      try {
        this.services = await this.$services.showAll({ company: this.company._id });
      } catch (e) {
        console.error(e);
      }
    },
    async refreshMandates () {
      try {
        this.customer.payment.mandates = await this.$customers.getMandates(this.customer._id);

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      }
    },
    async refreshQuotes () {
      try {
        this.customer.quotes = await this.$customers.getQuotes(this.customer._id);

        this.$store.commit('rh/saveUserProfile', this.customer);
        this.$v.customer.$touch();
      } catch (e) {
        console.error(e);
      }
    },
    async refreshCustomer () {
      this.customer = await this.$customers.getById(this.userProfile._id);
      await this.refreshSubscriptions();
      await this.refreshFundings();

      this.$store.commit('rh/saveUserProfile', this.customer);
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
        unitTTCRate: '',
        estimatedWeeklyVolume: '',
      };
    },
    async submitSubscription () {
      try {
        this.$v.newSubscription.$touch();
        if (this.$v.newSubscription.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedSubscription();
        await this.$customers.addSubscription(this.customer._id, payload);
        await this.refreshCustomer();
        this.subscriptionCreationModal = false;
        NotifyPositive('Souscription ajoutée');
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative(e.data.message);
        NotifyNegative("Erreur lors de l'ajout d'une souscription");
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
        const payload = this.$_.pickBy(this.editedSubscription);
        delete payload._id;
        delete payload.nature;
        await this.$customers.updateSubscription({ _id: this.customer._id, subscriptionId }, payload);
        this.refreshCustomer();
        this.subscriptionEditionModal = false;
        NotifyPositive('Souscription modifiée');
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la modification d'une souscription")
      } finally {
        this.loading = false;
      }
    },
    async removeSubscriptions (subscriptionId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer cette souscription ?',
          ok: true,
          cancel: 'Annuler',
        }).onOk(async () => {
          const params = { subscriptionId, _id: this.customer._id };
          await this.$customers.removeSubscription(params);
          await this.refreshCustomer();
          NotifyPositive('Souscription supprimée');
        }).onCancel(() => NotifyPositive('Suppression annulée'));
      } catch (e) {
        console.error(e);
      }
    },
    // Mandates
    async updateSignedAt (mandate) {
      try {
        if (!mandate.signedAt || this.tmpInput === mandate.signedAt) return;
        const params = {
          _id: this.customer._id,
          mandateId: mandate._id,
        };
        await this.$customers.updateMandate(params, mandate);
        this.refreshMandates();
        NotifyPositive('Modification enregistrée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification');
      }
    },
    async downloadMandate (doc) {
      try {
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
        const params = { driveId: this.company.customersConfig.templates.debitMandate.driveId };

        await downloadDocxFile(params, data, 'mandat.docx');
        NotifyPositive('Mandat téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement du mandat.');
      }
    },
    // Documents
    failMsg () {
      NotifyNegative('Echec de l\'envoi du document');
    },
    // Quotes
    async downloadQuote (doc) {
      try {
        const subscriptions = this.subscriptions.map(subscription => {
          let estimatedWeeklyRate = this.computeWeeklyRate(subscription);
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
        });

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
        const params = { driveId: this.company.customersConfig.templates.quote.driveId };
        await downloadDocxFile(params, data, 'devis.docx');
        NotifyPositive('Devis téléchargé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du téléchargement du devis.');
      }
    },
    async generateQuote () {
      try {
        const subscriptions = this.subscriptions.map(subscription => {
          const sub = {
            serviceName: subscription.service.name,
            unitTTCRate: subscription.unitTTCRate,
            estimatedWeeklyVolume: subscription.estimatedWeeklyVolume,
          }
          if (subscription.sundays) sub.sundays = subscription.sundays;
          if (subscription.evenings) sub.evenings = subscription.evenings;

          return sub;
        });
        const payload = { subscriptions };
        await this.$customers.addQuote(this.customer._id, payload);
        await this.refreshQuotes();
        NotifyPositive('Devis généré');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la génération du devis');
      }
    },
    // Fundings
    async getThirdPartyPayersOptions () {
      try {
        const thirdPartyPayers = await this.$thirdPartyPayers.showAll({ company: this.company._id });
        this.fundingTppOptions = thirdPartyPayers.map(tpp => ({ label: tpp.name, value: tpp._id }));
      } catch (e) {
        this.fundingTppOptions = [];
        console.error(e);
      }
    },
    async openFundingCreationModal () {
      await this.getThirdPartyPayersOptions();
      this.fundingCreationModal = true;
    },
    resetFundingFrequency () {
      if (this.newFunding.nature === FIXED && this.newFunding.frequency !== ONCE) {
        this.newFunding.frequency = '';
      }
    },
    fundingSubscriptionsOptions () {
      return this.subscriptions.filter(sub => sub.service.nature !== FIXED).map(sub => ({ label: sub.service.name, value: sub._id }));
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
        frequency: '',
        endDate: '',
        nature: '',
        amountTTC: '',
        unitTTCRate: '',
        customerParticipationRate: 0,
        careDays: [0, 1, 2, 3, 4, 5, 6, 7],
        subscription: '',
      };
    },
    formatCreatedFunding () {
      const cleanPayload = this.$_.pickBy(this.newFunding);
      const { nature, thirdPartyPayer, subscription, ...version } = cleanPayload;
      return {
        nature,
        thirdPartyPayer,
        subscription,
        versions: [{...version}],
      };
    },
    async submitFunding () {
      try {
        this.$v.newFunding.$touch();
        if (this.$v.newFunding.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedFunding();
        await this.$customers.addFunding(this.customer._id, payload);
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
    async removeFunding (fundingId) {
      try {
        await this.$q.dialog({
          title: 'Confirmation',
          message: 'Es-tu sûr(e) de vouloir supprimer ce financement ?',
          ok: true,
          cancel: 'Annuler',
        }).onOk(async () => {
          const params = { fundingId, _id: this.customer._id };
          await this.$customers.removeFunding(params);
          await this.refreshCustomer();
          NotifyPositive('Financement supprimé');
        }).onCancel(() => NotifyPositive('Suppression annulée'));
      } catch (e) {
        console.error(e);
      }
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
    async editFunding () {
      try {
        this.$v.editedFunding.$touch();
        if (this.$v.editedFunding.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        const { folderNumber, endDate, frequency, amountTTC, unitTTCRate, careHours, careDays, customerParticipationRate, startDate, subscription } = this.editedFunding;
        const payload = {
          folderNumber,
          frequency,
          careDays,
          customerParticipationRate,
          startDate,
          endDate,
          subscription,
        };
        if (this.editedFunding.nature === FIXED) payload.amountTTC = amountTTC;
        if (this.editedFunding.nature === HOURLY) {
          payload.unitTTCRate = unitTTCRate;
          payload.careHours = careHours;
        }
        const cleanPayload = this.$_.pickBy(payload);
        await this.$customers.updateFunding({ _id: this.customer._id, fundingId: this.editedFunding._id }, cleanPayload);
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
  a
    color: $primary
    text-decoration: none

  .mandate-table
    /deep/ .q-table
      margin: 10px 0px
    td
      word-break: break-all

  .inactiveDot
    background: $secondary
  .signedAt
    /deep/ .q-field--with-bottom
      padding: 0
    /deep/ .q-field__bottom
      display: none
</style>
