<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Structures partenaires" class="q-mb-xl" />
    <ni-table-list :data="partnerOrganizations" :columns="columns" :pagination.sync="pagination" :loading="tableLoading"
      :rows-per-page="[15, 50, 100, 200]">
      <template #body="{ col }">
        <template>{{ col.value }}</template>
      </template>
    </ni-table-list>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une structure"
      @click="partnerOrganizationCreationModal = true" />

    <partner-organization-creation-modal v-model="partnerOrganizationCreationModal" @submit="createPartnerOrganization"
      :new-partner-organization.sync="newPartnerOrganization" :loading="modalLoading" @hide="resetModal"
      :validations="$v.newPartnerOrganization" />
  </q-page>
</template>
<script>
import { required, email, requiredIf } from 'vuelidate/lib/validators';
import omit from 'lodash/omit';
import pickBy from 'lodash/pickBy';
import get from 'lodash/get';
import TitleHeader from '@components/TitleHeader';
import TableList from '@components/table/TableList';
import PartnerOrganization from '@api/PartnerOrganizations';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import { frPhoneNumber, frAddress } from '@helpers/vuelidateCustomVal';
import { sortStrings } from '@helpers/utils';
import PartnerOrganizationCreationModal from 'src/modules/client/components/customers/PartnerOrganizationCreationModal';

export default {
  metaInfo: { title: 'Structures partenaires' },
  name: 'PartnerOrgarnizationsDirectory',
  components: {
    'ni-title-header': TitleHeader,
    'partner-organization-creation-modal': PartnerOrganizationCreationModal,
    'ni-table-list': TableList,
  },
  data () {
    return {
      partnerOrganizationCreationModal: false,
      newPartnerOrganization: { name: '', phone: '', address: {}, email: '' },
      modalLoading: false,
      tableLoading: false,
      partnerOrganizations: [],
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: 'name',
          align: 'left',
          sortable: true,
          sort: (a, b) => sortStrings(a, b),
        },
      ],
      pagination: { sortBy: 'createdAt', descending: true, page: 1, rowsPerPage: 15 },
    };
  },
  validations: {
    newPartnerOrganization: {
      name: { required },
      phone: { frPhoneNumber },
      address: {
        zipCode: { required: requiredIf(item => item && !!item.fullAddress) },
        street: { required: requiredIf(item => item && !!item.fullAddress) },
        city: { required: requiredIf(item => item && !!item.fullAddress) },
        fullAddress: { frAddress },
      },
      email: { email },
    },
  },
  async mounted () {
    await this.refreshPartnerOrganizations();
  },
  methods: {
    async refreshPartnerOrganizations () {
      try {
        this.tableLoading = true;
        const partnerOrganizations = await PartnerOrganization.list();
        this.partnerOrganizations = Object.freeze(partnerOrganizations);
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

        this.$v.newPartnerOrganization.$touch();
        if (this.$v.newPartnerOrganization.$error) return NotifyWarning('Champ(s) invalide(s).');

        const payload = this.formatPayload(this.newPartnerOrganization);
        await PartnerOrganization.create(payload);

        this.partnerOrganizationCreationModal = false;
        NotifyPositive('Structure partenaire créée.');

        await this.refreshPartnerOrganizations();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyWarning(e.data.message);
        NotifyNegative('Erreur lors de la création de la structure partenaire.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetModal () {
      this.$v.newPartnerOrganization.$reset();
      this.newPartnerOrganization = { name: '', phone: '', address: {}, email: '' };
    },
  },
};
</script>
