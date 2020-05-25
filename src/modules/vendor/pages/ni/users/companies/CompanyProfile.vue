<template>
  <q-page padding class="vendor-background">
    <ni-profile-header :title="companyTradeName">
      <template v-slot:body>
        <div class="profile-info col-mb-6 col-xs-12 q-pl-lg">
          <q-item>
            <q-item-section side><q-icon size="xs" name="bookmark_border"/></q-item-section>
            <q-item-section class="text-capitalize">{{ companyType }}</q-item-section>
          </q-item>
        </div>
      </template>
    </ni-profile-header>
    <profile-tabs :profile-id="companyId" :tabsContent="tabsContent" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import { COMPANY_TYPES } from '@data/constants';
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
      companyTradeName: '',
      tabsContent: [{ label: 'Infos', name: 'infos', default: this.defaultTab === 'infos', component: ProfileInfo }],
    }
  },
  computed: {
    ...mapState('company', ['company']),
    companyType () {
      const companyType = COMPANY_TYPES.find(type => type.value === get(this.company, 'type'));
      return companyType ? companyType.label : '';
    },
  },
  watch: {
    company () {
      this.companyTradeName = get(this.company, 'tradeName') || '';
    },
  },
  async created () {
    if (!this.company) await this.refreshCompany();
    this.companyTradeName = get(this.company, 'tradeName') || '';
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
    this.$store.dispatch('company/reset');
  },
}
</script>

<style lang="stylus" scoped>
.q-item
  padding: 0
  min-height: 0
</style>
