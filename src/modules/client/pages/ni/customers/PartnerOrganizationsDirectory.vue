<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Structures partenaires" class="q-mb-xl" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une structure"
      @click="partnerOrganizationCreationModal = true" />

    <partner-organization-creation-modal :new-partner-organization="newPartnerOrganization" />
  </q-page>
</template>
<script>
import TitleHeader from '@components/TitleHeader';
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
      newPartnerOrganization: { name: '', phone: '', address: '', email: '' },
    };
  },
};
</script>
