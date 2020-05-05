<template>
  <q-page padding class="neutral-background">
    <ni-profile-header :title="companyName" />
    <profile-tabs :profile-id="companyId" :tabsContent="tabsContent" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import ProfileTabs from 'src/modules/client/components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/companies/ProfileInfo';

export default {
  name: 'CompanyProfile',
  metadata: { title: 'Fiche structure' },
  props: {
    companyId: { type: String },
    defaultTab: { type: String, default: 'infos' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  data () {
    return {
      tabsContent: [{ label: 'Infos', name: 'infos', default: this.defaultTab === 'infos', component: ProfileInfo }],
    }
  },
  computed: {
    ...mapState('company', ['company']),
    companyName () {
      return get(this.company, 'name') || '';
    },
  },
  async mounted () {
    if (!this.company) await this.refreshCompany();
  },
  methods: {
    async refreshCompany () {
      try {
        await this.$store.dispatch('company/get', { companyId: this.companyId });
      } catch (e) {
        console.error(e);
      }
    },
  },
  beforeDestroy () {
    this.$store.dispatch('company/remove');
  },
}
</script>
