<template>
  <q-page padding class="client-background">
    <ni-profile-header :title="partnerOrganization.name" />
  </q-page>
</template>

<script>
import PartnerOrganization from '@api/PartnerOrganizations';
import ProfileHeader from '@components/ProfileHeader';
import { NotifyNegative } from '@components/popup/notify';

export default {
  metaInfo: { title: 'Structure partenaire' },
  props: {
    partnerOrganizationId: { type: String, required: true },
  },
  components: {
    'ni-profile-header': ProfileHeader,
  },
  data () {
    return {
      partnerOrganization: {},
    };
  },
  async mounted () {
    await this.refreshPartnerOrganization();
  },
  methods: {
    async refreshPartnerOrganization () {
      try {
        this.partnerOrganization = await PartnerOrganization.getById(this.partnerOrganizationId);
      } catch (e) {
        this.partnerOrganization = {};
        console.error(e);
        NotifyNegative('Erreur lors de la récupération de la structure partenaire.');
      }
    },
  },
};
</script>
