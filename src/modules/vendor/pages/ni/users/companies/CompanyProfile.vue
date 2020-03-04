<template>
  <q-page padding class="neutral-background">
    <ni-profile-header :title="companyName" />
  </q-page>
</template>

<script>
import Company from '@api/Companies';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';

export default {
  name: 'CompanyProfile',
  metadata: { title: 'Fiche structure' },
  props: {
    companyId: { type: String },
  },
  components: {
    'ni-profile-header': ProfileHeader,
  },
  data () {
    return {
      company: {},
      companyName: '',
    }
  },
  async mounted () {
    await this.refreshCompany();
  },
  methods: {
    async refreshCompany () {
      try {
        this.company = await Company.getById(this.companyId);
      } catch (e) {
        console.error(e);
        this.company = {};
      } finally {
        this.companyName = this.company.name || '';
      }
    },
  },
}
</script>
