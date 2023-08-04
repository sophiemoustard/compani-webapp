<template>
  <q-page padding class="vendor-background">
    <ni-profile-header :title="companyName" :header-info="headerInfo" />
    <profile-tabs :profile-id="companyId" :tabs-content="tabsContent" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { computed, ref, watch, onBeforeUnmount, toRefs } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import { COMPANY_TYPES } from '@data/constants';
import ProfileHeader from '@components/ProfileHeader';
import ProfileTabs from '@components/ProfileTabs';
import ProfileInfo from 'src/modules/vendor/components/companies/ProfileInfo';
import ProfileBilling from 'src/modules/vendor/components/companies/ProfileBilling';

export default {
  name: 'CompanyProfile',
  props: {
    companyId: { type: String, required: true },
    defaultTab: { type: String, default: 'infos' },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'profile-tabs': ProfileTabs,
  },
  setup (props) {
    const metaInfo = { title: 'Fiche structure' };
    useMeta(metaInfo);
    const $store = useStore();
    const { defaultTab, companyId } = toRefs(props);

    const tabsContent = [
      { label: 'Infos', name: 'infos', default: defaultTab.value === 'infos', component: ProfileInfo },
      { label: 'Factures', name: 'bills', default: defaultTab.value === 'bills', component: ProfileBilling },
    ];
    const companyName = ref('');

    const company = computed(() => $store.state.company.company);
    const companyTypeLabel = computed(() => {
      const companyType = COMPANY_TYPES.find(type => type.value === get(company.value, 'type'));
      return companyType ? companyType.label : '';
    });
    const headerInfo = computed(() => [{ icon: 'bookmark_border', label: companyTypeLabel.value }]);

    const refreshCompany = async () => {
      try {
        await $store.dispatch('company/fetchCompany', { companyId: companyId.value });
      } catch (e) {
        console.error(e);
      }
    };

    const refreshCompanyName = () => { companyName.value = get(company, 'value.name') || ''; };

    watch(company, refreshCompanyName);

    const created = async () => {
      if (!company.value) await refreshCompany();
      refreshCompanyName();
    };

    onBeforeUnmount(() => $store.dispatch('company/resetCompany'));

    created();

    return {
      // Data
      tabsContent,
      companyName,
      // Computed
      headerInfo,
    };
  },
};
</script>

<style lang="sass" scoped>
.q-item
  padding: 0
  min-height: 0
</style>
