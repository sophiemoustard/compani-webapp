<template>
  <q-page padding class="client-background">
    <ni-title-header title="Factures" />
    <div v-if="loggedUser">
      <ni-select v-if="hasHoldingRole" caption="Structure" :model-value="selectedCompany._id"
        :options="companiesOptions" @update:model-value="setCompany($event)" clearable class="q-mt-xl" />
      <course-billing-infos :company="company" @refresh-company="refreshCompany" />
    </div>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import keyBy from 'lodash/keyBy';
import { useMeta } from 'quasar';
import { computed, ref, onBeforeUnmount } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import Companies from '@api/Companies';
import TitleHeader from '@components/TitleHeader';
import Select from '@components/form/Select';
import { NotifyNegative } from '@components/popup/notify';
import CourseBillingInfos from '@components/courseBilling/CourseBillingInfos';
import { formatAndSortOptions } from '@helpers/utils';

export default {
  name: 'BillingProfile',
  components: {
    'ni-title-header': TitleHeader,
    'course-billing-infos': CourseBillingInfos,
    'ni-select': Select,
  },
  setup () {
    const metaInfo = { title: 'Factures' };
    useMeta(metaInfo);

    const $route = useRoute();

    const holdingCompanies = ref({});
    const selectedCompany = ref({});
    const companiesOptions = ref([]);

    const $store = useStore();
    const loggedUser = computed(() => $store.state.main.loggedUser);

    const hasHoldingRole = computed(() => !!get(loggedUser.value, 'role.holding'));

    const company = computed(() => (hasHoldingRole.value ? selectedCompany.value : loggedUser.value.company));

    const setCompany = async (companyId) => {
      if (!companyId) {
        selectedCompany.value = {};
        return;
      }
      selectedCompany.value = holdingCompanies.value[companyId];
      if (!$store.state.company.company) await $store.dispatch('company/fetchCompany', { companyId });
    };

    const refreshHoldingCompanies = async () => {
      try {
        const companies = await Companies.list({ holding: loggedUser.value.holding._id });
        holdingCompanies.value = keyBy(companies, '_id');
        companiesOptions.value = formatAndSortOptions(companies, 'name');
      } catch (e) {
        console.error(e);
        holdingCompanies.value = {};
        companiesOptions.value = [];
        NotifyNegative('Erreur lors de la récupération des structures.');
      }
    };

    const refreshCompany = async () => {
      try {
        if (hasHoldingRole.value) {
          if (company.value._id) await $store.dispatch('company/fetchCompany', { companyId: company.value._id });
          if ($store.state.company.company) {
            holdingCompanies.value[$store.state.company.company._id] = $store.state.company.company;
            setCompany($store.state.company.company._id);
          }
        } else await $store.dispatch('main/fetchLoggedUser', loggedUser.value._id);
      } catch (e) {
        console.error(e);
      }
    };

    const created = async () => {
      await refreshCompany();
      if (hasHoldingRole.value) await refreshHoldingCompanies();
    };

    created();

    onBeforeUnmount(() => {
      if ($route.name !== 'ni courses info') $store.dispatch('company/resetCompany');
    });

    return {
      // Data
      selectedCompany,
      companiesOptions,
      // Computed
      loggedUser,
      company,
      hasHoldingRole,
      // Methods
      setCompany,
      refreshCompany,
    };
  },
};
</script>
