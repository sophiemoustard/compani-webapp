<template>
  <q-page padding class="neutral-background">
    <ni-profile-header :title="companyName" />
    <profile-tabs :profile-id="companyId" :tabsContent="tabsContent" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapGetters } from 'vuex';
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
      companyName: '',
      tabsContent: [{ label: 'Infos', name: 'infos', default: this.defaultTab === 'infos', component: ProfileInfo }],
    }
  },
  computed: {
    ...mapGetters({
      company: 'company/getCompany',
    }),
  },
  async mounted () {
    if (!this.company) await this.refreshCompany();
    else this.companyName = get(this.company, 'name') || '';
  },
  watch: {
    company () {
      this.companyName = get(this.company, 'name') || '';
    },
  },
  methods: {
    async refreshCompany () {
      try {
        await this.$store.dispatch('company/getCompany', { companyId: this.companyId });
        this.companyName = get(this.company, 'name') || '';
      } catch (e) {
        console.error(e);
      }
    },
  },
}
</script>
