<template>
  <div v-if="isLoaded">
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Pratique</p>
      </div>
      <div class="row gutter-profile">
        <ni-search-address v-if="isAuxiliary" caption="Adresse principale" v-model="customer.contact.primaryAddress"
          color="white" disable />
        <ni-search-address v-if="isAuxiliary && hasSecondaryAddress" caption="Adresse secondaire"
          v-model="customer.contact.secondaryAddress" color="white" disable />
        <ni-input caption="Accès / Codes / Étage" v-model="customer.contact.accessCodes" type="textarea"
          @focus="saveTmp('contact.accessCodes')" @blur="updateCustomer('contact.accessCodes')" />
        <ni-input v-if="isAuxiliary" type="tel" :error="v$.customer.contact.phone.$error"
          error-message="Numéro de téléphone non valide" caption="Téléphone" v-model.trim="customer.contact.phone"
          @focus="saveTmp('contact.phone')" @blur="updateCustomer('contact.phone')" />
        <ni-input v-if="isAuxiliary" caption="Compléments" v-model="customer.contact.others"
          @blur="updateCustomer('contact.others')" @focus="saveTmp('contact.others')" />
        <div class="flex-column col-xs-12 col-md-6">
          <p class="input-caption">Horodatage</p>
          <ni-bi-color-button icon="file_download" label="QR Code" size="16px" @click="downloadQRCode()" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Auxiliaire référent(e)</p>
      </div>
      <div class="row gutter-profile">
        <div class="col-md-6 col-xs-12 referent items-center">
          <img :src="auxiliaryAvatar" class="avatar q-mr-sm">
          <ni-select v-model="customer.referent._id" :options="auxiliariesOptions" no-error icon="swap_vert"
            @focus="saveTmp('referent')" @update:model-value="updateCustomer('referent')" />
        </div>
      </div>
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Accompagnement</p>
      </div>
      <div class="row gutter-profile">
        <ni-select caption="Situation" v-model="customer.followUp.situation" @focus="saveTmp('followUp.situation')"
          @update:model-value="updateCustomer('followUp.situation')" :options="situationOptions" />
        <ni-input caption="Environnement" v-model="customer.followUp.environment"
          @blur="updateCustomer('followUp.environment')" @focus="saveTmp('followUp.environment')" type="textarea" />
        <ni-input caption="Objectifs de l’accompagnement" v-model="customer.followUp.objectives"
          @blur="updateCustomer('followUp.objectives')" @focus="saveTmp('followUp.objectives')" type="textarea" />
        <ni-input caption="Autres" v-model="customer.followUp.misc" type="textarea"
          @blur="updateCustomer('followUp.misc')" @focus="saveTmp('followUp.misc')" />
      </div>
    </div>
    <div class="q-mb-xl">
      <customer-notes-container :notes-list="notesList" v-model:display-all-notes="displayAllNotes"
        @open-new-note-modal="openNewNoteModal = true" @open-edited-note-modal="openNoteEditionModal" />
    </div>
    <div class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Aidants</p>
      </div>
      <ni-simple-table :data="sortedHelpers" :columns="helpersColumns" :visible-columns="visibleColumns"
        :loading="helpersLoading" :rows-per-page="rowsPerPage" v-model:pagination="pagination">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'phone'">
                <a v-if="col.value" class="text-primary" :href="getPhoneLink(col.value)">{{ col.value }}</a>
                <div v-else>{{ col.value }}</div>
              </template>
             <template v-else>{{ col.value }}</template>
           </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Partenaires</p>
      <q-card>
        <ni-responsive-table :data="partners" :columns="partnersColumns" v-model:pagination="pagination"
          class="q-mb-md" :loading="partnersLoading">
          <template #header="{ props }">
            <q-tr :props="props">
              <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style"
                :class="[{ 'table-actions-responsive': col.name === 'actions' }]">
                {{ col.label }}
              </q-th>
            </q-tr>
          </template>
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'prescriber'">
                  <q-checkbox :model-value="prescriberPartner === props.row._id"
                    @update:model-value="updatePrescriberPartner(props.row._id)" />
                </template>
                <template v-if="col.name === 'actions'">
                  <ni-button icon="close" @click="validatePartnerDeletion(col.value)" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <q-btn flat no-caps color="primary" icon="add" label="Ajouter un(e) partenaire" :disable="partnersLoading"
            @click="openNewPartnerModal" />
        </q-card-actions>
      </q-card>
    </div>
    <div v-if="fundingsMonitoring.length" class="q-mb-xl">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Financements</p>
      </div>
      <ni-simple-table :data="fundingsMonitoring" :columns="fundingsMonitoringColumns" :loading="fundingsLoading"
        :rows-per-page="rowsPerPage" v-model:pagination="pagination" />
    </div>
    <div class="q-mb-xl" v-if="customer.firstIntervention">
      <div class="row justify-between items-baseline">
        <p class="text-weight-bold">Auxiliaires</p>
      </div>
      <ni-simple-table :data="customerFollowUp" :columns="followUpColumns" :loading="followUpLoading"
        :rows-per-page="rowsPerPage" v-model:pagination="pagination">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'identity'">
                <q-item>
                  <q-item-section avatar>
                    <img :src="getAvatar(col.value)" class="avatar">
                  </q-item-section>
                  <q-item-section>
                    <span class="identity-block q-mr-sm">
                      {{ formatIdentity(col.value.identity, 'Fl') }} ({{ col.value.sector.name }})
                    </span>
                  </q-item-section>
                </q-item>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
    </div>

    <customer-partner-creation-modal v-model="newPartnerModal" :loading="modalLoading"
      :partner-options="partnerOptions" v-model:new-partner="newPartner" @submit="addPartner"
      @hide="resetAddPartnerModal" :validations="v$.newPartner" />

    <customer-note-creation-modal v-model="openNewNoteModal" @hide="resetCreationCustomerNote"
      @submit="createCustomerNote" v-model:new-note="newNote" :validations="v$.newNote"
      :loading="noteLoading" />

    <customer-note-edition-modal v-model="openEditedNoteModal" @hide="resetEditionCustomerNote"
      @submit="editCustomerNote" v-model:edited-note="editedNote" :validations="v$.editedNote" :loading="noteLoading" />
  </div>
</template>

<script>
import { mapGetters, mapState } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import get from 'lodash/get';
import Stats from '@api/Stats';
import Users from '@api/Users';
import Partners from '@api/Partners';
import CustomerPartners from '@api/CustomerPartners';
import CustomerNotes from '@api/CustomerNotes';
import Button from '@components/Button';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import ResponsiveTable from '@components/table/ResponsiveTable';
import SearchAddress from '@components/form/SearchAddress';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import SimpleTable from '@components/table/SimpleTable';
import BiColorButton from '@components/BiColorButton';
import {
  AUXILIARY,
  PLANNING_REFERENT,
  AUXILIARY_ROLES,
  DEFAULT_AVATAR,
  UNKNOWN_AVATAR,
  SITUATION_OPTIONS,
  JOB_OPTIONS,
} from '@data/constants';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { formatIdentity, formatAndSortIdentityOptions, formatPhone } from '@helpers/utils';
import { formatDate, formatHours } from '@helpers/date';
import { validationMixin } from '@mixins/validationMixin';
import { customerMixin } from 'src/modules/client/mixins/customerMixin';
import { helperMixin } from 'src/modules/client/mixins/helperMixin';
import CustomerNoteCreationModal from 'src/modules/client/components/customers/infos/CustomerNoteCreationModal';
import CustomerNoteEditionModal from 'src/modules/client/components/customers/infos/CustomerNoteEditionModal';
import CustomerNotesContainer from 'src/modules/client/components/table/CustomerNotesContainer';
import CustomerPartnerCreationModal from './infos/CustomerPartnerCreationModal';

export default {
  name: 'ProfileFollowUp',
  components: {
    'ni-input': Input,
    'ni-select': Select,
    'ni-button': Button,
    'ni-search-address': SearchAddress,
    'ni-simple-table': SimpleTable,
    'ni-responsive-table': ResponsiveTable,
    'customer-partner-creation-modal': CustomerPartnerCreationModal,
    'customer-notes-container': CustomerNotesContainer,
    'customer-note-creation-modal': CustomerNoteCreationModal,
    'customer-note-edition-modal': CustomerNoteEditionModal,
    'ni-bi-color-button': BiColorButton,
  },
  mixins: [customerMixin, validationMixin, helperMixin],
  setup () { return { v$: useVuelidate() }; },
  data () {
    return {
      rowsPerPage: [5, 10, 15, 20],
      pagination: { page: 1, rowsPerPage: 5 },
      auxiliaries: [],
      isLoaded: false,
      tmpInput: '',
      loading: false,
      visibleColumns: ['lastname', 'firstname', 'email', 'phone'],
      customerFollowUp: [],
      followUpLoading: false,
      followUpColumns: [
        { name: 'identity', align: 'left', field: row => row },
        {
          name: 'hours',
          align: 'center',
          label: 'Heures réalisées',
          field: 'totalHours',
          format: value => formatHours(value, 1),
        },
        {
          name: 'lastEvent',
          align: 'center',
          label: 'Dernière inter.',
          field: row => get(row, 'lastEvent.startDate') || '',
          format: formatDate,
        },
      ],
      fundingsMonitoring: [],
      fundingsLoading: false,
      fundingsMonitoringColumns: [
        { name: 'thirdPartyPayer', align: 'left', label: 'Financeur', field: 'thirdPartyPayer' },
        { name: 'careHours', align: 'center', label: 'Heures attribuées', field: 'careHours' },
        {
          name: 'prevMonthCareHours',
          align: 'center',
          label: 'Mois dernier',
          field: 'prevMonthCareHours',
          format: value => (value === -1 ? 'N/A' : formatHours(value, 1)),
        },
        {
          name: 'currentMonthCareHours',
          align: 'center',
          label: 'Mois en cours',
          field: 'currentMonthCareHours',
          format: value => formatHours(value, 1),
        },
      ],
      situationOptions: SITUATION_OPTIONS,
      modalLoading: false,
      newPartnerModal: false,
      partnersLoading: false,
      newPartner: '',
      partnerOptions: [],
      partners: [],
      partnersList: [],
      partnersColumns: [
        { name: 'firstname', label: 'Prénom', align: 'left', field: row => get(row, 'partner.identity.firstname') },
        { name: 'lastname', label: 'Nom', align: 'left', field: row => get(row, 'partner.identity.lastname') },
        { name: 'email', label: 'Email', align: 'left', field: row => get(row, 'partner.email') },
        {
          name: 'phone',
          label: 'Téléphone',
          align: 'left',
          field: row => get(row, 'partner.phone'),
          format: formatPhone,
        },
        {
          name: 'job',
          label: 'Profession',
          align: 'left',
          field: row => get(JOB_OPTIONS.find(option => option.value === get(row, 'partner.job')), 'label') || '',
        },
        {
          name: 'partnerOrganization',
          label: 'Structure',
          align: 'left',
          field: row => get(row, 'partner.partnerOrganization.name'),
        },
        { name: 'prescriber', label: 'Prescripteur', align: 'left' },
        { name: 'actions', label: '', field: '_id' },
      ],
      prescriberPartner: '',
      notesList: [],
      newNote: { title: '', description: '' },
      editedNote: { _id: '', title: '', description: '' },
      displayAllNotes: false,
      openNewNoteModal: false,
      openEditedNoteModal: false,
      noteLoading: false,
    };
  },
  validations () {
    return {
      customer: {
        contact: {
          phone: { frPhoneNumber },
        },
      },
      newPartner: { required },
      newNote: { title: { required }, description: { required } },
      editedNote: { title: { required }, description: { required } },
    };
  },
  computed: {
    ...mapState('customer', ['customer']),
    ...mapGetters({ clientRole: 'main/getClientRole' }),
    auxiliaryAvatar () {
      const auxiliaryPicture = get(this.customer, 'referent.picture') || null;
      return this.getAuxiliaryAvatar(auxiliaryPicture);
    },
    isAuxiliary () {
      return AUXILIARY_ROLES.includes(this.clientRole);
    },
    hasSecondaryAddress () {
      return !!get(this.customer, 'contact.secondaryAddress.fullAddress');
    },
    auxiliariesOptions () {
      const auxiliariesOptions = [{ label: 'Pas d\'auxiliaire référent(e)', value: '' }];
      const referentId = get(this.customer, 'referent._id') || null;
      if (this.auxiliaries.length) {
        auxiliariesOptions.push(...formatAndSortIdentityOptions(this.auxiliaries));
      } else if (referentId) {
        const identity = get(this.customer, 'referent.identity') || {};
        auxiliariesOptions.push({ label: formatIdentity(identity, 'FL'), value: referentId });
      }

      return auxiliariesOptions;
    },
    auxiliaryPlaceholder () {
      return (this.customer.referent.identity)
        ? formatIdentity(this.customer.referent.identity, 'FL')
        : 'Pas d\'auxiliaire référent(e)';
    },
    partnersNotAdded () {
      return this.partnersList.filter(partner => !this.partners.map(p => p._id).includes(partner._id));
    },
  },
  async mounted () {
    const promises = [
      this.refreshCustomer(),
      this.getUserHelpers(),
      this.getAuxiliaries(),
      this.refreshPartnerOptions(),
      this.getCustomerNotes(),
    ];
    if (this.customer.firstIntervention) promises.push(this.getCustomerFollowUp());
    if (this.customer.fundings && this.customer.fundings.length) promises.push(this.getCustomerFundingsMonitoring());
    await Promise.all(promises);
  },
  methods: {
    formatIdentity,
    getAuxiliaryAvatar (picture) {
      return picture ? get(picture, 'link') || DEFAULT_AVATAR : UNKNOWN_AVATAR;
    },
    toggleAuxiliarySelect () {
      return this.$refs.auxiliarySelect.show();
    },
    async getAuxiliaries () {
      try {
        this.loading = true;
        const activeAuxiliaries = await Users.listActive({
          role: [AUXILIARY, PLANNING_REFERENT],
          company: this.company._id,
        });
        this.auxiliaries = activeAuxiliaries.filter(aux => aux.contracts.some(c => !c.endDate));
        this.loading = false;
      } catch (e) {
        this.auxiliaries = [];
        this.loading = false;
      }
    },
    async getCustomerFollowUp () {
      try {
        this.followUpLoading = true;
        this.customerFollowUp = await Stats.getCustomerFollowUp({ customer: this.customer._id });
      } catch (e) {
        this.customerFollowUp = [];
        NotifyNegative('Erreur lors de la récupération des auxiliaires.');
      } finally {
        this.followUpLoading = false;
      }
    },
    async getCustomerFundingsMonitoring () {
      try {
        this.fundingsLoading = true;
        this.fundingsMonitoring = await Stats.getCustomerFundingsMonitoring({ customer: this.customer._id });
      } catch (e) {
        console.error(e);
        this.fundingsMonitoring = [];
        NotifyNegative('Erreur lors de la récupération du suivi des financements.');
      } finally {
        this.fundingsLoading = false;
      }
    },
    async refreshCustomer () {
      try {
        await this.$store.dispatch('customer/fetchCustomer', { customerId: this.customer._id });
        this.v$.customer.$touch();
        this.isLoaded = true;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du chargement des données.');
      }
    },
    async getCustomerNotes () {
      try {
        this.notesList = await CustomerNotes.list({ customer: this.customer._id });
      } catch (e) {
        console.error(e);
        this.notesList = [];
      }
    },
    saveTmp (path) {
      this.tmpInput = path === 'referent' ? get(this.customer, 'referent._id', '') : get(this.customer, path);
    },
    getPhoneLink (link) {
      return link ? `tel:+33${link.substring(1)}` : '-';
    },
    getAvatar (value) {
      const link = get(value, 'picture.link', '');
      return link || DEFAULT_AVATAR;
    },
    async  refreshPartnerOptions () {
      try {
        await this.refreshCustomerPartners();
        this.partnersList = await Partners.list();
        this.partnerOptions = formatAndSortIdentityOptions(this.partnersNotAdded);
      } catch (e) {
        console.error(e);
        this.partnerOptions = [];
      }
    },
    async refreshCustomerPartners () {
      try {
        this.partners = await CustomerPartners.list({ customer: this.customer._id });
        const prescriberPartner = this.partners.find(p => p.prescriber);
        this.prescriberPartner = get(prescriberPartner, '_id') || '';
      } catch (e) {
        console.error(e);
        this.partners = [];
      }
    },
    async addPartner () {
      try {
        this.modalLoading = true;
        this.v$.newPartner.$touch();
        if (this.v$.newPartner.$error) return NotifyWarning('Champ(s) invalide(s).');

        await CustomerPartners.create({ partner: this.newPartner, customer: this.customer._id });
        NotifyPositive('Partenaire ajouté.');

        this.newPartnerModal = false;
        await this.refreshPartnerOptions();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyWarning(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout du/de la partenaire.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetAddPartnerModal () {
      this.v$.newPartner.$reset();
      this.newPartner = '';
    },
    openNewPartnerModal () {
      if (!this.partnersNotAdded.length) return NotifyWarning('Tous les partenaires ont déjà été ajoutés.');
      this.newPartnerModal = true;
    },
    async updatePrescriberPartner (value) {
      try {
        const payload = { prescriber: !(this.prescriberPartner === value) };
        await CustomerPartners.update(value, payload);
        NotifyPositive('Prescripteur modifié.');

        await this.refreshCustomerPartners();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'édition du/de la partenaire.');
      }
    },
    async deletePartner (customerPartnerId) {
      try {
        await CustomerPartners.delete(customerPartnerId);

        await this.refreshCustomerPartners();
        NotifyPositive('Partenaire supprimé.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du/de la partenaire.');
      }
    },
    validatePartnerDeletion (customerPartnerId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir retirer le/la partenaire ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deletePartner(customerPartnerId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    resetCreationCustomerNote () {
      this.v$.newNote.$reset();
      this.newNote = { title: '', description: '' };
    },
    resetEditionCustomerNote () {
      this.v$.editedNote.$reset();
      this.editedNoted = { _id: '', title: '', description: '' };
    },
    async createCustomerNote () {
      try {
        this.v$.newNote.$touch();
        if (this.v$.newNote.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.noteLoading = true;
        const payload = { ...this.newNote, customer: this.customer._id };
        await CustomerNotes.create(payload);

        this.openNewNoteModal = false;
        await this.getCustomerNotes();
        NotifyPositive('Note de suivi ajoutée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la note de suivi.');
      } finally {
        this.noteLoading = false;
      }
    },
    openNoteEditionModal (editedNote) {
      this.openEditedNoteModal = true;
      this.editedNote = editedNote;
    },
    async editCustomerNote () {
      try {
        this.v$.editedNote.$touch();
        if (this.v$.editedNote.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.noteLoading = true;
        const payload = { title: this.editedNote.title.trim(), description: this.editedNote.description.trim() };
        await CustomerNotes.update(this.editedNote._id, payload);

        this.openEditedNoteModal = false;
        await this.getCustomerNotes();
        NotifyPositive('Note de suivi mise à jour.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la mise à jour de la note de suivi.');
      } finally {
        this.noteLoading = false;
      }
    },
  },
};
</script>

<style lang="sass" scoped>
.identity-block
  display: inline-block
  font-size: 12px
.referent
  display: flex
  :deep(.q-field__append)
    .q-select__dropdown-icon
      display: none
</style>
