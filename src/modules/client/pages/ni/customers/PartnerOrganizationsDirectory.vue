<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Structures partenaires" class="q-mb-xl" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une structure"
      @click="partnerOrganizationCreationModal = true" />

    <partner-organization-creation-modal :value="partnerOrganizationCreationModal" @submit="createPartnerOrganization"
      :new-partner-organization.sync="newPartnerOrganization" :loading="loading" @hide="resetModal" />
  </q-page>
</template>
<script>
import omit from 'lodash/omit';
import get from 'lodash/get';
import TitleHeader from '@components/TitleHeader';
import PartnerOrganization from '@api/PartnerOrganizations';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import PartnerOrganizationCreationModal from 'src/modules/client/components/customers/PartnerOrganizationCreationModal';

export default {
  metaInfo: { title: 'Structures partenaires' },
  name: 'PartnerOrgarnizationsDirectory',
  components: {
    'ni-title-header': TitleHeader,
    'partner-organization-creation-modal': PartnerOrganizationCreationModal,
  },
  data () {
    return {
      partnerOrganizationCreationModal: false,
      newPartnerOrganization: { name: '', phone: '', address: {}, email: '' },
      loading: false,
    };
  },
  methods: {
    async createPartnerOrganization () {
      try {
        this.loading = true;

        const payload = get(this.newPartnerOrganization, 'address.fullAddress')
          ? this.newPartnerOrganization
          : omit(this.newPartnerOrganization, ['address']);

        await PartnerOrganization.create(payload);

        this.partnerOrganizationCreationModal = false;
        NotifyPositive('Structure partenaire créée');
      } catch (e) {
        console.error(e);
        if (e.statusCode === 409) console.log('e', e);
        NotifyNegative('Erreur lors de la création de la structure partenaire.');
      } finally {
        this.loading = false;
      }
    },
    resetModal () {
      this.newPartnerOrganization = { name: '', phone: '', address: {}, email: '' };
    },
  },
};
</script>
