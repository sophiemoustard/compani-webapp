<template>
  <q-page padding class="client-background">
    <ni-title-header title="Factures" />
    <div v-if="loggedUser">
      <ni-select v-if="hasHoldingRole" caption="Structure" :model-value="selectedCompany._id"
        :options="companiesOptions" @update:model-value="setCompany($event)" class="q-mt-xl" />
      <course-billing-infos v-if="company._id" :company="company" @refresh-company="refreshCompany" />
    </div>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { useMeta } from 'quasar';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
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

    const holdingCompanies = ref([]);
    const selectedCompany = ref({});
    const companiesOptions = ref([]);

    const $store = useStore();
    const loggedUser = computed(() => $store.state.main.loggedUser);

    const hasHoldingRole = computed(() => !!get(loggedUser.value, 'role.holding'));

    const company = computed(() => {
      if (hasHoldingRole.value) return selectedCompany.value;
      return loggedUser.value.company;
    });

    const setCompany = async (companyId) => {
      selectedCompany.value = holdingCompanies.value.find(c => c._id === companyId);
      await $store.dispatch('company/fetchCompany', { companyId });
    };

    const refreshHoldingCompanies = async () => {
      try {
        holdingCompanies.value = await Companies.list({ holding: loggedUser.value.holding._id });
        companiesOptions.value = formatAndSortOptions(holdingCompanies.value, 'name');
      } catch (e) {
        console.error(e);
        holdingCompanies.value = [];
        NotifyNegative('Erreur lors de la récupération des structures.');
      }
    };

    const refreshCompany = async () => {
      try {
        if (hasHoldingRole.value) {
          if (company.value._id) await $store.dispatch('company/fetchCompany', { companyId: company.value._id });
          if ($store.state.company.company) selectedCompany.value = $store.state.company.company;
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
