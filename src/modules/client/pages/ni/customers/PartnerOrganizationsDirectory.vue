<template>
  <q-page class="client-background" padding>
    <ni-title-header title="Structures partenaires" class="q-mb-xl" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une structure"
      @click="partnerOrganizationCreationModal = true" />

    <partner-organization-creation-modal v-model="partnerOrganizationCreationModal" @submit="createPartnerOrganization"
      :new-partner-organization.sync="newPartnerOrganization" :loading="loading" @hide="resetModal"
      :validations="$v.newPartnerOrganization" />
  </q-page>
</template>
<script>
import { required, email, requiredIf } from 'vuelidate/lib/validators';
import omit from 'lodash/omit';
import get from 'lodash/get';
import TitleHeader from '@components/TitleHeader';
import PartnerOrganization from '@api/PartnerOrganizations';
import { NotifyPositive, NotifyWarning, NotifyNegative } from '@components/popup/notify';
import { frPhoneNumber, frAddress } from '@helpers/vuelidateCustomVal';
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
  methods: {
    async createPartnerOrganization () {
      try {
        this.loading = true;

        this.$v.newPartnerOrganization.$touch();
        if (this.$v.newPartnerOrganization.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = get(this.newPartnerOrganization, 'address.fullAddress')
          ? this.newPartnerOrganization
          : omit(this.newPartnerOrganization, ['address']);

        await PartnerOrganization.create(payload);

        this.partnerOrganizationCreationModal = false;
        NotifyPositive('Structure partenaire créée');
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyWarning(e.data.message);
        NotifyNegative('Erreur lors de la création de la structure partenaire.');
      } finally {
        this.loading = false;
      }
    },
    resetModal () {
      this.$v.newPartnerOrganization.$reset();
      this.newPartnerOrganization = { name: '', phone: '', address: {}, email: '' };
    },
  },
};
</script>
