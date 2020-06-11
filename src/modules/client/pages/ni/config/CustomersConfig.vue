<template>
  <q-page class="client-background" padding>
    <div v-if="company">
      <h4>Configuration bénéficiaires</h4>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Plans de majoration</p>
        <q-card>
          <ni-responsive-table :data="surcharges" :columns="surchargesColumns" :pagination.sync="pagination"
            :loading="surchargesLoading">
            <template v-slot:body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <q-btn flat round small dense color="grey" icon="edit"
                        @click.native="openSurchargeEditionModal(col.value)" />
                      <q-btn flat round small dense color="grey" icon="delete"
                        @click="validateSurchargeDeletion(col.value, props.row)" />
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un plan de majoration"
              @click="surchargeCreationModal = true" :disable="surchargesLoading" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Services</p>
        <q-card>
          <ni-responsive-table :data="services" :columns="serviceColumns" :pagination.sync="pagination"
            :visible-columns="servicesVisibleColumns" :loading="servicesLoading">
            <template v-slot:body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <q-btn flat round small dense color="grey" icon="history" @click="showHistory(col.value)" />
                      <q-btn flat round small dense color="grey" icon="edit"
                        @click="openServiceEditionModal(col.value)" />
                      <q-btn flat round small dense color="grey" icon="delete"
                        :disable="props.row.subscriptionCount > 0"
                        @click="validateServiceDeletion(col.value, props.row)" />
                    </div>
                  </template>
                  <template v-else>{{ col.value }}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un service"
              @click="serviceCreationModal = true" :disable="servicesLoading" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Documents</p>
        <div class="row gutter-profile">
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Mandat de prélèvement" path="customersConfig.templates.debitMandate"
              :entity="company" alt="template mandat prelevement" name="debitMandate"
              @delete="validateDocumentDeletion(documents.debitMandate.driveId, 'debitMandate', 'customersConfig')"
              @uploaded="documentUploaded" :additional-value="`modele_mandat_prelevement_${company.name}`"
              :url="docsUploadUrl" />
          </div>
          <div class="col-xs-12 col-md-6">
            <ni-file-uploader caption="Devis" path="customersConfig.templates.quote" alt="template devis" name="quote"
              @delete="validateDocumentDeletion(documents.quote.driveId, 'quote', 'customersConfig')" :entity="company"
              @uploaded="documentUploaded" :additional-value="`modele_devis_${company.name}`" :url="docsUploadUrl" />
          </div>
        </div>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Tiers payeurs</p>
        <q-card>
          <ni-responsive-table :data="thirdPartyPayers" :columns="thirdPartyPayersColumns" :loading="tppsLoading"
            :pagination.sync="pagination">
            <template v-slot:body="{ props }">
              <q-tr :props="props">
                <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                  :style="col.style">
                  <template v-if="col.name === 'billingMode'">
                    <div class="capitalize">{{ col.value }}</div>
                  </template>
                  <template v-else-if="col.name === 'actions'">
                    <div class="row no-wrap table-actions">
                      <q-btn flat round small dense color="grey" icon="edit"
                        @click="openThirdPartyPayerEditionModal(col.value)" />
                      <q-btn :disable="isTppUsedInFundings(props.row)" flat round small dense color="grey"
                        icon="delete" @click="validateTppDeletion(col.value, props.row)" />
                    </div>
                  </template>
                  <template v-else>{{ col.value}}</template>
                </q-td>
              </q-tr>
            </template>
          </ni-responsive-table>
          <q-card-actions align="right">
            <q-btn no-caps flat color="primary" icon="add" label="Ajouter un tiers payeur"
              @click="thirdPartyPayerCreationModal = true" :disable="tppsLoading" />
          </q-card-actions>
        </q-card>
      </div>
      <div class="q-mb-xl">
        <p class="text-weight-bold">Facturation</p>
        <div class="row gutter-profile">
          <ni-select caption="Période de facturation par défaut" v-model="company.customersConfig.billingPeriod" in-form
            @focus="saveTmp('customersConfig.billingPeriod')" @blur="updateCompany('customersConfig.billingPeriod')"
            :options="billingPeriodOptions" />
        </div>
      </div>
    </div>

    <!-- Surcharge creation modal -->
    <ni-modal v-model="surchargeCreationModal" @hide="resetCreationSurchargeData">
      <template slot="title">
        Créer un <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newSurcharge.name" :error="$v.newSurcharge.name.$error"
        @blur="$v.newSurcharge.name.$touch" required-field />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" v-model="newSurcharge.saturday"
        :error="$v.newSurcharge.saturday.$error" @blur="$v.newSurcharge.saturday.$touch"
        :error-label="nbrError('newSurcharge.saturday')" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" v-model="newSurcharge.sunday"
        :error="$v.newSurcharge.sunday.$error" @blur="$v.newSurcharge.sunday.$touch"
        :error-label="nbrError('newSurcharge.sunday')" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" type="number" v-model="newSurcharge.publicHoliday"
        :error="$v.newSurcharge.publicHoliday.$error" @blur="$v.newSurcharge.publicHoliday.$touch"
        :error-label="nbrError('newSurcharge.publicHoliday')" />
      <ni-input in-modal caption="Majoration 25 décembre" suffix="%" type="number"
        v-model="newSurcharge.twentyFifthOfDecember" :error-label="nbrError('newSurcharge.twentyFifthOfDecember')"
        @blur="$v.newSurcharge.twentyFifthOfDecember.$touch" :error="$v.newSurcharge.twentyFifthOfDecember.$error" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" v-model="newSurcharge.firstOfMay"
        :error="$v.newSurcharge.firstOfMay.$error" @blur="$v.newSurcharge.firstOfMay.$touch"
        :error-label="nbrError('newSurcharge.firstOfMay')" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" v-model="newSurcharge.evening"
        :error="$v.newSurcharge.evening.$error" @blur="$v.newSurcharge.evening.$touch"
        :error-label="nbrError('newSurcharge.evening')" />
      <ni-time-input in-modal v-model="newSurcharge.eveningStartTime" caption="Début soirée"
        :error="$v.newSurcharge.eveningStartTime.$error" @blur="$v.newSurcharge.eveningStartTime.$touch"
        :disable="!newSurcharge.evening" :requiredField="!!newSurcharge.evening" error-label="Heure invalide" />
      <ni-time-input in-modal v-model="newSurcharge.eveningEndTime" caption="Fin soirée"
        :error="$v.newSurcharge.eveningEndTime.$error" @blur="$v.newSurcharge.eveningEndTime.$touch"
        :disable="!newSurcharge.evening" :requiredField="!!newSurcharge.evening" error-label="Heure invalide" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" type="number" v-model="newSurcharge.custom"
        :error="$v.newSurcharge.custom.$error" @blur="$v.newSurcharge.custom.$touch" />
      <ni-time-input in-modal v-model="newSurcharge.customStartTime" caption="Début personnalisé"
        :error="$v.newSurcharge.customStartTime.$error" @blur="$v.newSurcharge.customStartTime.$touch"
        :disable="!newSurcharge.custom" :requiredField="!!newSurcharge.custom" error-label="Heure invalide" />
      <ni-time-input in-modal v-model="newSurcharge.customEndTime" caption="Fin personnalisée"
        :error="$v.newSurcharge.customEndTime.$error" @blur="$v.newSurcharge.customEndTime.$touch"
        :disable="!newSurcharge.custom" :requiredField="!!newSurcharge.custom" error-label="Heure invalide" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer le plan de majoration" icon-right="add" color="primary"
          :loading="loading" @click="createNewSurcharge" />
      </template>
    </ni-modal>

    <!-- Surcharge edition modal -->
    <ni-modal v-model="surchargeEditionModal" @hide="resetEditionSurchargeData">
      <template slot="title">
        Éditer le <span class="text-weight-bold">plan de majoration</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="editedSurcharge.name" :error="$v.editedSurcharge.name.$error"
        @blur="$v.editedSurcharge.name.$touch" required-field />
      <ni-input in-modal caption="Majoration samedi" suffix="%" type="number" v-model="editedSurcharge.saturday"
        :error="$v.editedSurcharge.saturday.$error" @blur="$v.editedSurcharge.saturday.$touch"
        :error-label="nbrError('editedSurcharge.saturday')" />
      <ni-input in-modal caption="Majoration dimanche" suffix="%" type="number" v-model="editedSurcharge.sunday"
        :error="$v.editedSurcharge.sunday.$error" @blur="$v.editedSurcharge.sunday.$touch"
        :error-label="nbrError('editedSurcharge.sunday')" />
      <ni-input in-modal caption="Majoration jour férié" suffix="%" type="number"
        v-model="editedSurcharge.publicHoliday" :error="$v.editedSurcharge.publicHoliday.$error"
        @blur="$v.editedSurcharge.publicHoliday.$touch" :error-label="nbrError('editedSurcharge.publicHoliday')" />
      <ni-input in-modal caption="Majoration 25 décembre" :error="$v.editedSurcharge.twentyFifthOfDecember.$error"
        v-model="editedSurcharge.twentyFifthOfDecember" :error-label="nbrError('editedSurcharge.twentyFifthOfDecember')"
        @blur="$v.editedSurcharge.twentyFifthOfDecember.$touch" suffix="%" type="number" />
      <ni-input in-modal caption="Majoration 1er mai" suffix="%" type="number" v-model="editedSurcharge.firstOfMay"
        :error="$v.editedSurcharge.firstOfMay.$error" @blur="$v.editedSurcharge.firstOfMay.$touch"
        :error-label="nbrError('editedSurcharge.firstOfMay')" />
      <ni-input in-modal caption="Majoration soirée" suffix="%" type="number" v-model="editedSurcharge.evening"
        :error="$v.editedSurcharge.evening.$error" @blur="$v.editedSurcharge.evening.$touch"
        :error-label="nbrError('editedSurcharge.evening')" firstOfMay />
      <ni-time-input in-modal v-model="editedSurcharge.eveningStartTime" caption="Début soirée"
        :error="$v.editedSurcharge.eveningStartTime.$error" @blur="$v.editedSurcharge.eveningStartTime.$touch"
        :disable="!editedSurcharge.evening" :requiredField="!!editedSurcharge.evening" error-label="Heure invalide" />
      <ni-time-input in-modal v-model="editedSurcharge.eveningEndTime" caption="Fin soirée"
        :error="$v.editedSurcharge.eveningEndTime.$error" @blur="$v.editedSurcharge.eveningEndTime.$touch"
        :disable="!editedSurcharge.evening" :requiredField="!!editedSurcharge.evening" error-label="Heure invalide" />
      <ni-input in-modal caption="Majoration personnalisée" suffix="%" type="number" v-model="editedSurcharge.custom"
        :error="$v.editedSurcharge.custom.$error" @blur="$v.editedSurcharge.custom.$touch" />
      <ni-time-input in-modal v-model="editedSurcharge.customStartTime" caption="Début personnalisé"
        :error="$v.editedSurcharge.customStartTime.$error" @blur="$v.editedSurcharge.customStartTime.$touch"
        :disable="!editedSurcharge.custom" :requiredField="!!editedSurcharge.custom" error-label="Heure invalide" />
      <ni-time-input in-modal v-model="editedSurcharge.customEndTime" caption="Fin personnalisée"
        :error="$v.editedSurcharge.customEndTime.$error" @blur="$v.editedSurcharge.customEndTime.$touch"
        :disable="!editedSurcharge.custom" :requiredField="!!editedSurcharge.custom" error-label="Heure invalide" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer le plan de majoration" icon-right="check"
          color="primary" :loading="loading" @click="updateSurcharge" />
      </template>
    </ni-modal>

    <!-- Service creation modal -->
    <ni-modal v-model="serviceCreationModal" @hide="resetCreationServiceData">
      <template slot="title">
        Créer un <span class="text-weight-bold">service</span>
      </template>
      <ni-select in-modal caption="Type" v-model="newService.type" :error="$v.newService.type.$error"
        @blur="$v.newService.type.$touch" :options="serviceTypeOptions" required-field />
      <ni-input in-modal caption="Nom" v-model="newService.name" :error="$v.newService.name.$error"
        @blur="$v.newService.name.$touch" required-field />
      <ni-select in-modal caption="Nature" v-model="newService.nature" :error="$v.newService.nature.$error"
        @blur="$v.newService.nature.$touch" :options="natureOptions" required-field />
      <ni-input in-modal caption="Prix unitaire par défaut TTC" suffix="€" type="number"
        v-model="newService.defaultUnitAmount" :error="$v.newService.defaultUnitAmount.$error" required-field
        @blur="$v.newService.defaultUnitAmount.$touch" :error-label="nbrError('newService.defaultUnitAmount')" />
      <ni-input in-modal caption="TVA" suffix="%" v-model="newService.vat" type="number"
        :error="$v.newService.vat.$error" @blur="$v.newService.vat.$touch"
        error-label="La TVA doit être positive ou nulle" />
      <ni-select in-modal v-if="newService.nature !== FIXED" caption="Plan de majoration" v-model="newService.surcharge"
        :options="surchargesOptions" clearable />
      <div class="row q-mb-md">
        <q-checkbox label="Exonération de charges" v-model="newService.exemptFromCharges" dense />
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer le service" icon-right="add" color="primary"
          :loading="loading" @click="createNewService" />
      </template>
    </ni-modal>

    <!-- Service edition modal -->
    <ni-modal v-model="serviceEditionModal" @hide="resetEditionServiceData">
      <template slot="title">
        Éditer le <span class="text-weight-bold">service</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="editedService.name" :error="$v.editedService.name.$error"
        @blur="$v.editedService.name.$touch" required-field />
      <ni-date-input caption="Date d'effet" v-model="editedService.startDate" :error="$v.editedService.startDate.$error"
        @blur="$v.editedService.startDate.$touch" :min="minStartDate" in-modal required-field />
      <ni-input in-modal caption="Prix unitaire par défaut TTC" suffix="€" type="number"
        v-model="editedService.defaultUnitAmount" :error="$v.editedService.defaultUnitAmount.$error" required-field
        @blur="$v.editedService.defaultUnitAmount.$touch" :error-label="nbrError('editedService.defaultUnitAmount')" />
      <ni-input in-modal caption="TVA" suffix="%" v-model="editedService.vat" type="number"
        :error="$v.editedService.vat.$error" @blur="$v.editedService.vat.$touch"
        error-label="La TVA doit être positive ou nulle" />
      <ni-select in-modal v-if="editedService.nature !== FIXED" caption="Plan de majoration"
        v-model="editedService.surcharge" :options="surchargesOptions" clearable />
      <div class="row q-mb-md">
        <q-checkbox label="Exonération de charges" v-model="editedService.exemptFromCharges" dense />
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer le service" icon-right="check" color="primary"
          :loading="loading" @click="updateService" />
      </template>
    </ni-modal>

    <!-- Service history modal -->
    <ni-modal v-model="serviceHistoryModal" @hide="resetServiceHistoryData" container-class="modal-container-md">
      <template slot="title">
        Historique du service <span class="text-weight-bold">{{ selectedService.name }}</span>
      </template>
      <ni-responsive-table class="q-mb-sm" :data="selectedService.versions" :columns="serviceColumns"
        :pagination.sync="paginationHistory" :visible-columns="visibleHistoryColumns" />
    </ni-modal>

    <!-- Third party payers creation modal -->
    <ni-modal v-model="thirdPartyPayerCreationModal" @hide="resetThirdPartyPayerCreation">
      <template slot="title">
        Ajouter un <span class="text-weight-bold">tiers payeur</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newThirdPartyPayer.name" :error="$v.newThirdPartyPayer.name.$error"
        @blur="$v.newThirdPartyPayer.name.$touch" required-field />
      <ni-search-address v-model="newThirdPartyPayer.address" error-label="Adresse invalide" in-modal
        @blur="$v.newThirdPartyPayer.address.$touch" :error="$v.newThirdPartyPayer.address.$error" />
      <ni-input in-modal caption="Email" v-model.trim="newThirdPartyPayer.email" />
      <ni-input in-modal caption="Prix unitaire TTC par défaut" suffix="€" type="number"
        v-model="newThirdPartyPayer.unitTTCRate" :error="$v.newThirdPartyPayer.unitTTCRate.$error"
        :error-label="nbrError('newThirdPartyPayer.unitTTCRate')" />
      <ni-select in-modal v-model="newThirdPartyPayer.billingMode" :options="billingModeOptions" caption="Facturation"
        :filter="false" required-field :error="$v.newThirdPartyPayer.billingMode.$error"
        @blur="$v.newThirdPartyPayer.billingMode.$touch" />
      <div class="row q-mb-md light-checkbox">
        <q-checkbox v-model="newThirdPartyPayer.isApa" label="Financement APA" dense />
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter le tiers payeur" icon-right="add" color="primary"
          :loading="loading" @click="createNewThirdPartyPayer" />
      </template>
    </ni-modal>

    <!-- Third party payers edition modal -->
    <ni-modal v-model="thirdPartyPayerEditionModal" @hide="resetThirdPartyPayerEdition">
      <template slot="title">
        Editer le <span class="text-weight-bold">tiers payeur</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="editedThirdPartyPayer.name"
        :error="$v.editedThirdPartyPayer.name.$error" @blur="$v.editedThirdPartyPayer.name.$touch" required-field />
      <ni-search-address v-model="editedThirdPartyPayer.address" error-label="Adresse invalide"
        @blur="$v.editedThirdPartyPayer.address.$touch" :error="$v.editedThirdPartyPayer.address.$error" in-modal />
      <ni-input in-modal caption="Email" v-model.trim="editedThirdPartyPayer.email" />
      <ni-input in-modal caption="Prix unitaire TTC par défaut" suffix="€" type="number"
        v-model="editedThirdPartyPayer.unitTTCRate" :error="$v.editedThirdPartyPayer.unitTTCRate.$error"
        :error-label="nbrError('editedThirdPartyPayer.unitTTCRate')" />
      <ni-select in-modal v-model="editedThirdPartyPayer.billingMode" :options="billingModeOptions"
        caption="Facturation" :filter="false" required-field :error="$v.editedThirdPartyPayer.billingMode.$error"
        @blur="$v.editedThirdPartyPayer.billingMode.$touch" />
      <div class="row q-mb-md light-checkbox">
        <q-checkbox v-model="editedThirdPartyPayer.isApa" label="Financement APA" dense />
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer le tiers payeur" icon-right="check" color="primary"
          :loading="loading" @click="updateThirdPartyPayer" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import capitalize from 'lodash/capitalize';
import cloneDeep from 'lodash/cloneDeep';
import pickBy from 'lodash/pickBy';
import pick from 'lodash/pick';
import get from 'lodash/get';
import { required, numeric, requiredIf } from 'vuelidate/lib/validators';
import Services from '@api/Services';
import Surcharges from '@api/Surcharges';
import ThirdPartyPayers from '@api/ThirdPartyPayers';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import DateInput from '@components/form/DateInput.vue';
import TimeInput from '@components/form/TimeInput.vue';
import FileUploader from '@components/form/FileUploader.vue';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import SearchAddress from '@components/form/SearchAddress.vue';
import Modal from '@components/modal/Modal';
import ReponsiveTable from '@components/table/ResponsiveTable';
import { frAddress, positiveFloat, positiveNumber } from '@helpers/vuelidateCustomVal';
import {
  BILLING_DIRECT,
  BILLING_INDIRECT,
  CONTRACT_STATUS_OPTIONS,
  TWO_WEEKS,
  MONTH,
  NATURE_OPTIONS,
  FIXED,
  COMPANY,
} from '@data/constants.js';
import { configMixin } from 'src/modules/client/mixins/configMixin';
import { validationMixin } from 'src/modules/client/mixins/validationMixin.js';
import { tableMixin } from 'src/modules/client/mixins/tableMixin.js';

export default {
  name: 'CustomersConfig',
  metaInfo: { title: 'Configuration bénéficiaire' },
  components: {
    'ni-file-uploader': FileUploader,
    'ni-input': Input,
    'ni-select': Select,
    'ni-search-address': SearchAddress,
    'ni-date-input': DateInput,
    'ni-time-input': TimeInput,
    'ni-modal': Modal,
    'ni-responsive-table': ReponsiveTable,
  },
  mixins: [configMixin, validationMixin, tableMixin],
  watch: {
    'editedSurcharge.evening' (value) {
      if (!value) {
        this.editedSurcharge.eveningStartTime = null;
        this.editedSurcharge.eveningEndTime = null;
      }
    },
    'editedSurcharge.custom' (value) {
      if (!value) {
        this.editedSurcharge.customStartTime = null;
        this.editedSurcharge.customEndTime = null;
      }
    },
    'newSurcharge.evening' (value) {
      if (!value) {
        this.newSurcharge.eveningStartTime = null;
        this.newSurcharge.eveningEndTime = null;
      }
    },
    'newSurcharge.custom' (value) {
      if (!value) {
        this.newSurcharge.customStartTime = null;
        this.newSurcharge.customEndTime = null;
      }
    },
  },
  data () {
    return {
      loading: false,
      company: null,
      documents: null,
      FIXED,
      COMPANY,
      billingPeriodOptions: [
        { value: TWO_WEEKS, label: 'Quinzaine' },
        { value: MONTH, label: 'Mois' },
      ],
      // Surcharges
      surcharges: [],
      surchargeCreationModal: false,
      surchargeEditionModal: false,
      surchargesOptions: [],
      selectedSurcharge: {},
      newSurcharge: {
        name: '',
        saturday: '',
        sunday: '',
        publicHoliday: '',
        twentyFifthOfDecember: '',
        firstOfMay: '',
        evening: '',
        eveningStartTime: null,
        eveningEndTime: null,
        custom: '',
        customStartTime: null,
        customEndTime: null,
      },
      editedSurcharge: {
        name: '',
        saturday: '',
        sunday: '',
        publicHoliday: '',
        twentyFifthOfDecember: '',
        firstOfMay: '',
        evening: '',
        eveningStartTime: null,
        eveningEndTime: null,
        custom: '',
        customStartTime: null,
        customEndTime: null,
      },
      surchargesColumns: [
        { name: 'name', label: 'Nom', align: 'left', field: 'name' },
        {
          name: 'saturday',
          label: 'Samedi',
          align: 'center',
          field: row => row.saturday && `${row.saturday}%`,
        },
        {
          name: 'sunday',
          label: 'Dimanche',
          align: 'center',
          field: row => row.sunday && `${row.sunday}%`,
        },
        {
          name: 'publicHoliday',
          label: 'Jour férié',
          align: 'center',
          field: row => row.publicHoliday && `${row.publicHoliday}%`,
        },
        {
          name: 'twentyFifthOfDecember',
          label: '25 décembre',
          align: 'center',
          field: row => row.twentyFifthOfDecember && `${row.twentyFifthOfDecember}%`,
        },
        {
          name: 'firstOfMay',
          label: '1er mai',
          align: 'center',
          field: row => row.firstOfMay && `${row.firstOfMay}%`,
        },
        {
          name: 'evening',
          label: 'Soirée',
          align: 'center',
          field: row => row.evening && `${row.evening}%`,
        },
        {
          name: 'eveningStartTime',
          label: 'Début soirée',
          align: 'center',
          field: row => row.eveningStartTime ? this.$moment(row.eveningStartTime).format('HH:mm') : '',
        },
        {
          name: 'eveningEndTime',
          label: 'Fin soirée',
          align: 'center',
          field: row => row.eveningEndTime ? this.$moment(row.eveningEndTime).format('HH:mm') : '',
        },
        {
          name: 'custom',
          label: 'Perso',
          align: 'center',
          field: row => row.custom && `${row.custom}%`,
        },
        {
          name: 'customStartTime',
          label: 'Début perso',
          align: 'center',
          field: row => row.customStartTime ? this.$moment(row.customStartTime).format('HH:mm') : '',
        },
        {
          name: 'customEndTime',
          label: 'Fin perso',
          align: 'center',
          field: row => row.customEndTime ? this.$moment(row.customEndTime).format('HH:mm') : '',
        },
        { name: 'actions', label: '', align: 'center', field: '_id' },
      ],
      surchargesLoading: false,
      // Services
      services: [],
      serviceCreationModal: false,
      serviceEditionModal: false,
      serviceHistoryModal: false,
      selectedService: {},
      newService: {
        name: '',
        type: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
        surcharge: null,
        exemptFromCharges: false,
      },
      editedService: {
        name: '',
        startDate: '',
        defaultUnitAmount: '',
        vat: '',
        nature: '',
        surcharge: null,
        exemptFromCharges: false,
      },
      natureOptions: NATURE_OPTIONS,
      serviceTypeOptions: CONTRACT_STATUS_OPTIONS,
      servicesVisibleColumns: ['name', 'nature', 'defaultUnitAmount', 'vat', 'surcharge', 'exemptFromCharges', 'actions'],
      visibleHistoryColumns: ['startDate', 'name', 'defaultUnitAmount', 'vat', 'surcharge', 'exemptFromCharges'],
      serviceColumns: [
        {
          name: 'startDate',
          label: 'Date d\'effet',
          align: 'left',
          field: row => row.startDate ? this.$moment(row.startDate).format('DD/MM/YYYY') : '',
        },
        { name: 'name', label: 'Nom', align: 'left', field: 'name' },
        {
          name: 'nature',
          label: 'Nature',
          align: 'left',
          format: (value) => {
            const nature = NATURE_OPTIONS.find(option => option.value === value);
            return nature ? capitalize(nature.label) : '';
          },
          field: 'nature',
        },
        {
          name: 'defaultUnitAmount',
          label: 'Prix unitaire TTC par défaut',
          align: 'center',
          field: 'defaultUnitAmount',
          format: value => `${value}€`,
        },
        {
          name: 'vat',
          label: 'TVA',
          align: 'center',
          field: row => row.vat && `${row.vat}%`,
        },
        {
          name: 'surcharge',
          label: 'Plan de majoration',
          align: 'left',
          field: row => row.surcharge ? row.surcharge.name : '',
        },
        {
          name: 'exemptFromCharges',
          label: 'Exonération de charges',
          align: 'center',
          field: row => row.exemptFromCharges ? 'Oui' : 'Non',
        },
        { name: 'actions', label: '', align: 'center', field: '_id' },
      ],
      servicesLoading: false,
      thirdPartyPayers: [],
      thirdPartyPayersColumns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
          sortable: true,
          style: !this.$q.platform.is.mobile && 'width: 250px',
        },
        { name: 'address', label: 'Adresse', align: 'left', field: row => get(row, 'address.fullAddress') || '' },
        { name: 'email', label: 'Email', field: 'email', align: 'left' },
        {
          name: 'unitTTCRate',
          label: 'Prix unitaire TTC par défaut',
          field: 'unitTTCRate',
          format: val => val ? `${val}€` : '',
          align: 'center',
        },
        {
          name: 'billingMode',
          label: 'Facturation',
          field: 'billingMode',
          align: 'center',
          format: val => {
            const mode = this.billingModeOptions.find(m => m.value === val);
            return mode ? mode.label : '';
          },
        },
        {
          name: 'isApa',
          label: 'APA',
          field: 'isApa',
          align: 'center',
          format: val => val ? 'Oui' : 'Non',
          style: !this.$q.platform.is.mobile && 'width: 100px',
        },
        {
          name: 'actions',
          label: '',
          align: 'center',
          field: '_id',
          style: !this.$q.platform.is.mobile && 'width: 100px',
        },
      ],
      tppsLoading: false,
      thirdPartyPayerCreationModal: false,
      newThirdPartyPayer: {
        name: '',
        email: '',
        address: { fullAddress: '' },
        unitTTCRate: '',
        billingMode: '',
        isApa: false,
      },
      billingModeOptions: [
        { label: 'Indirecte', value: BILLING_INDIRECT },
        { label: 'Directe', value: BILLING_DIRECT },
      ],
      thirdPartyPayerEditionModal: false,
      editedThirdPartyPayer: {
        address: {},
      },
      pagination: { rowsPerPage: 0 },
      paginationHistory: {
        rowsPerPage: 0,
        sortBy: 'startDate',
        descending: true,
      },
    };
  },
  validations: {
    newSurcharge: {
      name: { required },
      saturday: { numeric, positiveFloat },
      sunday: { numeric, positiveFloat },
      publicHoliday: { numeric, positiveFloat },
      twentyFifthOfDecember: { numeric, positiveFloat },
      firstOfMay: { numeric, positiveFloat },
      evening: { numeric, positiveFloat },
      eveningStartTime: { required: requiredIf((item) => item.evening) },
      eveningEndTime: { required: requiredIf((item) => item.evening) },
      custom: { numeric },
      customStartTime: { required: requiredIf((item) => item.custom) },
      customEndTime: { required: requiredIf((item) => item.custom) },
    },
    editedSurcharge: {
      name: { required },
      saturday: { numeric, positiveFloat },
      sunday: { numeric, positiveFloat },
      publicHoliday: { numeric, positiveFloat },
      twentyFifthOfDecember: { numeric, positiveFloat },
      firstOfMay: { numeric, positiveFloat },
      evening: { numeric, positiveFloat },
      eveningStartTime: { required: requiredIf((item) => item.evening) },
      eveningEndTime: { required: requiredIf((item) => item.evening) },
      custom: { numeric },
      customStartTime: { required: requiredIf((item) => item.custom) },
      customEndTime: { required: requiredIf((item) => item.custom) },
    },
    newService: {
      name: { required },
      type: { required },
      nature: { required },
      defaultUnitAmount: { required, positiveFloat, numeric },
      vat: { positiveNumber },
    },
    editedService: {
      name: { required },
      startDate: { required },
      defaultUnitAmount: { required, positiveFloat, numeric },
      vat: { positiveNumber },
    },
    company: {
      customersConfig: {
        bllingPeriod: { required },
      },
    },
    newThirdPartyPayer: {
      name: { required },
      address: {
        zipCode: { required: requiredIf(item => !!item.fullAddress) },
        street: { required: requiredIf(item => !!item.fullAddress) },
        city: { required: requiredIf(item => !!item.fullAddress) },
        fullAddress: { frAddress },
      },
      billingMode: { required },
      unitTTCRate: { positiveFloat, numeric },
      isApa: { required },
    },
    editedThirdPartyPayer: {
      name: { required },
      address: {
        zipCode: { required: requiredIf(item => !!item.fullAddress) },
        street: { required: requiredIf(item => !!item.fullAddress) },
        city: { required: requiredIf(item => !!item.fullAddress) },
        fullAddress: { frAddress },
      },
      billingMode: { required },
      unitTTCRate: { positiveFloat, numeric },
      isApa: { required },
    },
  },
  computed: {
    docsUploadUrl () {
      return `${process.env.API_HOSTNAME}/companies/${this.company._id}/gdrive/${this.company.folderId}/upload`;
    },
    minStartDate () {
      const selectedService = this.services.find(ser => ser._id === this.editedService._id);
      return selectedService ? this.$moment(selectedService.startDate).add(1, 'd').toISOString() : '';
    },
  },
  async mounted () {
    await Promise.all([
      this.refreshCompany(),
      this.refreshSurcharges(),
      this.refreshServices(),
      this.refreshThirdPartyPayers(),
    ]);
  },
  methods: {
    getServiceLastVersion (service) {
      if (!service.versions || service.versions.length === 0) return {};

      return service.versions.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))[0];
    },
    // Refresh data
    async refreshSurcharges () {
      try {
        this.surchargesLoading = true;
        this.surchargesOptions = [];
        this.surcharges = await Surcharges.list();
        for (let l = this.surcharges.length, i = 0; i < l; i++) {
          if (this.surcharges[i].eveningStartTime) {
            this.surcharges[i].eveningStartTime = this.$moment(this.surcharges[i].eveningStartTime, 'HH:mm');
          }
          if (this.surcharges[i].eveningEndTime) {
            this.surcharges[i].eveningEndTime = this.$moment(this.surcharges[i].eveningEndTime, 'HH:mm');
          }
          if (this.surcharges[i].customStartTime) {
            this.surcharges[i].customStartTime = this.$moment(this.surcharges[i].customStartTime, 'HH:mm');
          }
          if (this.surcharges[i].customEndTime) {
            this.surcharges[i].customEndTime = this.$moment(this.surcharges[i].customEndTime, 'HH:mm');
          }
          this.surchargesOptions.push({ label: this.surcharges[i].name, value: this.surcharges[i]._id });
        }
      } catch (e) {
        NotifyNegative('Erreur lors du rafraîchissement des plans de majoration.');
        console.error(e);
        this.surcharges = [];
      } finally {
        this.surchargesLoading = false;
      }
    },
    async refreshServices () {
      try {
        this.servicesLoading = true;
        const services = await Services.list();
        this.services = services.map(service => ({
          ...this.getServiceLastVersion(service),
          ...service,
        }));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du rafraîchissement des services.');
        this.services = [];
      } finally {
        this.servicesLoading = false;
      }
    },
    async refreshCompany () {
      await this.$store.dispatch('main/fetchLoggedUser', this.loggedUser._id);
      this.company = this.loggedCompany;
      this.documents = this.company.customersConfig.templates || {};
      this.company.address = this.company.address || { fullAddress: '' };
    },
    async refreshThirdPartyPayers () {
      try {
        this.tppsLoading = true;
        this.thirdPartyPayers = await ThirdPartyPayers.list();
      } catch (e) {
        this.thirdPartyPayers = [];
        console.error(e);
      } finally {
        this.tppsLoading = false;
      }
    },
    // Surcharges
    resetCreationSurchargeData () {
      this.surchargeCreationModal = false;
      this.newSurcharge = {
        name: '',
        saturday: '',
        sunday: '',
        publicHoliday: '',
        twentyFifthOfDecember: '',
        firstOfMay: '',
        evening: '',
        eveningStartTime: null,
        eveningEndTime: null,
        custom: '',
        customStartTime: null,
        customEndTime: null,
      };
      this.$v.newSurcharge.$reset();
    },
    getSurchargePayload (surchargeType) {
      const payload = cloneDeep(surchargeType);
      if (surchargeType.eveningStartTime) {
        payload.eveningStartTime = this.$moment(surchargeType.eveningStartTime, 'HH:mm').format('HH:mm');
      }
      if (surchargeType.eveningEndTime) {
        payload.eveningEndTime = this.$moment(surchargeType.eveningEndTime, 'HH:mm').format('HH:mm');
      }
      if (surchargeType.customStartTime) {
        payload.customStartTime = this.$moment(surchargeType.customStartTime, 'HH:mm').format('HH:mm');
      }
      if (surchargeType.customEndTime) {
        payload.customEndTime = this.$moment(surchargeType.customEndTime, 'HH:mm').format('HH:mm');
      }

      return payload;
    },
    async createNewSurcharge () {
      try {
        this.$v.newSurcharge.$touch();
        if (this.$v.newSurcharge.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;

        const payload = this.getSurchargePayload(this.newSurcharge);
        await Surcharges.create(payload);
        NotifyPositive('Plan de majoration créé.');
        this.resetCreationSurchargeData();
        await this.refreshSurcharges();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du plan de majoration.');
      } finally {
        this.loading = false;
      }
    },
    openSurchargeEditionModal (id) {
      const selectedSurcharge = this.surcharges.find(surcharge => surcharge._id === id);
      const { eveningStartTime, eveningEndTime, customStartTime, customEndTime } = selectedSurcharge;
      const pickedFields = [
        '_id',
        'name',
        'saturday',
        'sunday',
        'publicHoliday',
        'twentyFifthOfDecember',
        'firstOfMay',
        'evening',
        'custom',
      ];
      this.editedSurcharge = {
        ...pick(selectedSurcharge, pickedFields),
        eveningStartTime: eveningStartTime ? this.$moment(eveningStartTime).format('HH:mm') : '',
        eveningEndTime: eveningEndTime ? this.$moment(eveningEndTime).format('HH:mm') : '',
        customStartTime: customStartTime ? this.$moment(customStartTime).format('HH:mm') : '',
        customEndTime: customEndTime ? this.$moment(customEndTime).format('HH:mm') : '',
      };
      this.surchargeEditionModal = true;
    },
    resetEditionSurchargeData () {
      this.surchargeEditionModal = false;
      this.editedSurcharge = {
        name: '',
        saturday: '',
        sunday: '',
        publicHoliday: '',
        twentyFifthOfDecember: '',
        firstOfMay: '',
        evening: '',
        eveningStartTime: null,
        eveningEndTime: null,
        custom: '',
        customStartTime: null,
        customEndTime: null,
      };
      this.$v.editedSurcharge.$reset();
    },
    async updateSurcharge () {
      try {
        this.$v.editedSurcharge.$touch();
        if (this.$v.editedSurcharge.$error) return NotifyWarning('Champ(s) invalide(s)');
        this.loading = true;
        const surchargeId = this.editedSurcharge._id;
        const payload = this.getSurchargePayload(this.editedSurcharge);
        delete payload._id;
        delete payload.company;
        await Surcharges.updateById(surchargeId, payload);
        NotifyPositive('Plan de majoration modifié.');
        this.resetEditionSurchargeData();
        await this.refreshSurcharges();
      } catch (e) {
        console.error(e)
        NotifyNegative('Erreur lors de la modification du plan de majoration.');
      } finally {
        this.loading = false;
      }
    },
    async deleteSurcharge (surchargeId, row) {
      try {
        const index = this.getRowIndex(this.surcharges, row);
        await Surcharges.remove(surchargeId);
        this.surcharges.splice(index, 1);
        NotifyPositive('Plan de majoration supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du plan de majoration.');
      }
    },
    validateSurchargeDeletion (surchargeId, row) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Etes-vous sûr de vouloir supprimer ce plan de majoration ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteSurcharge(surchargeId, row))
        .onCancel(() => NotifyPositive('Suppression annulée'));
    },
    // Services
    formatCreatedService () {
      const { nature, name, defaultUnitAmount, type, exemptFromCharges } = this.newService;
      const formattedService = {
        nature,
        versions: [{
          name,
          defaultUnitAmount,
          exemptFromCharges,
          startDate: this.$moment('1970-01-01').startOf('d').toISOString(), // first version does not have actual start date
        }],
        type,
      };
      if (this.newService.surcharge && this.newService.surcharge !== '') formattedService.versions[0].surcharge = this.newService.surcharge;
      if (this.newService.vat && this.newService.vat !== '') formattedService.versions[0].vat = this.newService.vat;
      return formattedService;
    },
    resetCreationServiceData () {
      this.serviceCreationModal = false;
      this.newService = {
        name: '',
        nature: '',
        defaultUnitAmount: '',
        vat: '',
        surcharge: null,
        exemptFromCharges: false,
      };
      this.$v.newService.$reset();
    },
    async createNewService () {
      try {
        this.$v.newService.$touch()
        if (this.$v.newService.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const payload = this.formatCreatedService();
        await Services.create(payload);
        NotifyPositive('Service créé.');
        this.resetCreationServiceData();
        await this.refreshServices();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du service.');
      } finally {
        this.loading = false;
      }
    },
    openServiceEditionModal (id) {
      const selectedService = this.services.find(service => service._id === id);
      const { name, defaultUnitAmount, vat, surcharge, nature, exemptFromCharges } = selectedService;
      this.editedService = {
        _id: selectedService._id,
        name: name || '',
        startDate: '',
        defaultUnitAmount: defaultUnitAmount || '',
        vat: vat || '',
        nature,
        surcharge: surcharge ? surcharge._id : null,
        exemptFromCharges,
      };

      this.serviceEditionModal = true;
    },
    resetEditionServiceData () {
      this.serviceEditionModal = false;
      this.editedService = {
        name: '',
        startDate: '',
        defaultUnitAmount: '',
        vat: '',
        nature: '',
        surcharge: null,
        exemptFromCharges: false,
      };
      this.$v.editedService.$reset();
    },
    async updateService () {
      try {
        this.$v.editedService.$touch();
        if (this.$v.editedService.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const serviceId = this.editedService._id;
        const payload = pickBy(this.editedService);
        delete payload._id;
        delete payload.nature;
        await Services.updateById(serviceId, payload);
        NotifyPositive('Service modifié');
        this.resetEditionServiceData();
        await this.refreshServices();
      } catch (e) {
        console.error(e)
        NotifyNegative('Erreur lors de la modification du service.');
      } finally {
        this.loading = false;
      }
    },
    async deleteService (serviceId, row) {
      try {
        const index = this.getRowIndex(this.services, row);
        await Services.remove(serviceId);
        this.services.splice(index, 1);
        NotifyPositive('Service supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du service.');
      }
    },
    validateServiceDeletion (serviceId, row) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Etes-vous sûr de vouloir supprimer ce service ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteService(serviceId, row))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    showHistory (id) {
      this.selectedService = this.services.find(ser => ser._id === id);
      this.serviceHistoryModal = true;
    },
    resetServiceHistoryData () {
      this.serviceHistoryModal = false;
      this.selectedService = {};
    },
    // Third party payers
    openThirdPartyPayerEditionModal (tppId) {
      this.thirdPartyPayerEditionModal = true;
      const currentThirdPartyPayer = this.thirdPartyPayers.find(tpp => tpp._id === tppId);
      const { name, address, email, unitTTCRate, billingMode, isApa } = currentThirdPartyPayer;
      this.editedThirdPartyPayer = {
        _id: currentThirdPartyPayer._id,
        name,
        address: { ...address } || {},
        email,
        unitTTCRate,
        billingMode,
        isApa,
      };
    },
    resetThirdPartyPayerCreation () {
      this.$v.newThirdPartyPayer.$reset();
      this.newThirdPartyPayer = {
        name: '',
        email: '',
        address: {},
        unitTTCRate: '',
        billingMode: '',
        isApa: false,
      }
    },
    formatThirdPartyPayerPayload (tpp) {
      const payload = cloneDeep(tpp);
      if (payload.address && !payload.address.fullAddress) delete payload.address;

      return { isApa: false, ...pickBy(payload) };
    },
    async createNewThirdPartyPayer () {
      try {
        const formIsValid = await this.waitForFormValidation(this.$v.newThirdPartyPayer);
        if (formIsValid) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        await ThirdPartyPayers.create(this.formatThirdPartyPayerPayload(this.newThirdPartyPayer));
        await this.refreshThirdPartyPayers();
        NotifyPositive('Tiers payeur créé.');
        this.thirdPartyPayerCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du tiers payeur.');
      } finally {
        this.loading = false;
      }
    },
    resetThirdPartyPayerEdition () {
      this.$v.editedThirdPartyPayer.$reset();
      this.editedThirdPartyPayer = { address: {} }
    },
    async updateThirdPartyPayer () {
      try {
        const formIsValid = await this.waitForFormValidation(this.$v.editedThirdPartyPayer);
        if (formIsValid) return NotifyWarning('Champ(s) invalide(s)');

        this.loading = true;
        const thirdPartyPayerId = this.editedThirdPartyPayer._id;
        delete this.editedThirdPartyPayer._id;
        const payload = this.editedThirdPartyPayer;
        await ThirdPartyPayers.updateById(thirdPartyPayerId, this.formatThirdPartyPayerPayload(payload));
        await this.refreshThirdPartyPayers();
        NotifyPositive('Tiers payeur modifié.');
        this.thirdPartyPayerEditionModal = false;
      } catch (e) {
        NotifyNegative('Erreur lors de la modification du tiers payeur.');
        console.error(e);
      } finally {
        this.loading = false;
      }
    },
    async deleteThirdPartyPayer (thirdPartyPayerId, row) {
      try {
        const index = this.getRowIndex(this.thirdPartyPayers, row);
        await ThirdPartyPayers.removeById(thirdPartyPayerId);
        this.thirdPartyPayers.splice(index, 1);
        NotifyPositive('Tiers payeur supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du tiers payeur.');
      }
    },
    validateTppDeletion (thirdPartyPayerId, row) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Etes-vous sûr de vouloir supprimer ce tiers payeur ?',
        ok: 'OK',
        cancel: 'Annuler',
      }).onOk(() => this.deleteThirdPartyPayer(thirdPartyPayerId, row))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    isTppUsedInFundings (tpp) {
      const index = this.getRowIndex(this.thirdPartyPayers, tpp);
      return this.thirdPartyPayers[index].isUsedInFundings;
    },
  },
}
</script>
