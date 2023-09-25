<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Structures partenaires" search-placeholder="Rechercher une structure"
      @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredPartnerOrganizations" :columns="columns" :visible-columns="visibleColumns"
      v-model:pagination="pagination" :loading="tableLoading" :path="path" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une structure"
      @click="partnerOrganizationCreationModal = true" />

    <partner-organization-creation-modal v-model="partnerOrganizationCreationModal" @submit="createPartnerOrganization"
      v-model:new-partner-organization="newPartnerOrganization" :loading="modalLoading" @hide="resetModal"
      :validations="v$.newPartnerOrganization" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import useVuelidate from '@vuelidate/core';
import { required, email, requiredIf } from '@vuelidate/validators';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import get from 'lodash/get';
import escapeRegExp from 'lodash/escapeRegExp';
import DirectoryHeader from '@components/DirectoryHeader.vue';
import TableList from '@components/table/TableList';
import PartnerOrganization from '@api/PartnerOrganizations';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import { frPhoneNumber, frAddress } from '@helpers/vuelidateCustomVal';
import { sortStrings, removeDiacritics } from '@helpers/utils';
import { ascendingSort } from '@helpers/date';
import { validationMixin } from '@mixins/validationMixin';
import PartnerOrganizationCreationModal from 'src/modules/client/components/customers/PartnerOrganizationCreationModal';

export default {
  name: 'PartnerOrgarnizationsDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'partner-organization-creation-modal': PartnerOrganizationCreationModal,
    'ni-table-list': TableList,
  },
  setup () {
    const metaInfo = { title: 'Structures partenaires' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  mixins: [validationMixin],
  data () {
    return {
      searchStr: '',
      partnerOrganizationCreationModal: false,
      newPartnerOrganization: { name: '', phone: '', address: {}, email: '' },
      modalLoading: false,
      tableLoading: false,
      partnerOrganizations: [],
      columns: [
        { name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true, sort: sortStrings },
        { name: 'createdAt', field: 'createdAt', sort: ascendingSort },
        {
          name: 'prescriptions',
          label: 'Prescriptions',
          field: row => row.prescribedCustomersCount || '0',
          align: 'left',
          sortable: true,
        },
      ],
      visibleColumns: ['name', 'prescriptions'],
      pagination: { sortBy: 'createdAt', descending: true, page: 1, rowsPerPage: 15 },
      path: { name: 'ni customers partner organizations info', params: 'partnerOrganizationId' },
    };
  },
  validations () {
    return {
      newPartnerOrganization: {
        name: { required },
        phone: { frPhoneNumber },
        address: {
          zipCode: { required: requiredIf(!!get(this.newPartnerOrganization, 'address.fullAddress')) },
          street: { required: requiredIf(!!get(this.newPartnerOrganization, 'address.fullAddress')) },
          city: { required: requiredIf(!!get(this.newPartnerOrganization, 'address.fullAddress')) },
          fullAddress: { frAddress },
        },
        email: { email },
      },
    };
  },
  computed: {
    filteredPartnerOrganizations () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.partnerOrganizations.filter(po => po.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    },
  },
  async mounted () {
    await this.refreshPartnerOrganizations();
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    async refreshPartnerOrganizations () {
      try {
        this.tableLoading = true;
        const partnerOrganizations = await PartnerOrganization.list();
        this.partnerOrganizations = Object.freeze(
          partnerOrganizations.map(po => ({ ...po, noDiacriticsName: removeDiacritics(po.name) }))
        );
      } catch (e) {
        this.partnerOrganizations = [];
        console.error(e);
      } finally {
        this.tableLoading = false;
      }
    },
    formatPayload (payload) {
      return get(payload, 'address.fullAddress') ? pickBy(payload) : pickBy(omit(payload, ['address']));
    },
    async createPartnerOrganization () {
      try {
        this.modalLoading = true;

        this.v$.newPartnerOrganization.$touch();
        const isValid = await this.waitForFormValidation(this.v$.newPartnerOrganization);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s).');

        const payload = this.formatPayload(this.newPartnerOrganization);
        await PartnerOrganization.create(payload);

        this.partnerOrganizationCreationModal = false;
        NotifyPositive('Structure partenaire créée.');

        await this.refreshPartnerOrganizations();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la création de la structure partenaire.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetModal () {
      this.v$.newPartnerOrganization.$reset();
      this.newPartnerOrganization = { name: '', phone: '', address: {}, email: '' };
    },
  },
};
</script>
