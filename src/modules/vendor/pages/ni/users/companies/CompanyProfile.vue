<template>
  <q-page padding class="vendor-background">
    <ni-profile-header :title="companyName" :header-info="headerInfo" />
    <profile-tabs :profile-id="companyId" :tabs-content="tabsContent" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import { COMPANY_TYPES } from '@data/constants';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/companies/ProfileInfo';

export default {
  name: 'CompanyProfile',
  metadata: { title: 'Fiche structure' },
  props: {
    companyId: { type: String, required: true },
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
    };
  },
  computed: {
    ...mapState('company', ['company']),
    companyType () {
      const companyType = COMPANY_TYPES.find(type => type.value === get(this.company, 'type'));
      return companyType ? companyType.label : '';
    },
    headerInfo () {
      return [{ icon: 'bookmark_border', label: this.companyType }];
    },
  },
  watch: {
    company () {
      this.companyName = get(this.company, 'name') || '';
    },
  },
  async created () {
    if (!this.company) await this.refreshCompany();
    this.companyName = get(this.company, 'name') || '';
  },
  methods: {
    async refreshCompany () {
      try {
        await this.$store.dispatch('company/fetchCompany', { companyId: this.companyId });
      } catch (e) {
        console.error(e);
      }
    },
  },
  beforeUnmount () {
    this.$store.dispatch('company/resetCompany');
  },
};
</script>

<style lang="sass" scoped>
.q-item
  padding: 0
  min-height: 0
</style>
