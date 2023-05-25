<template>
  <div v-if="holding">
    <p class="text-weight-bold q-mt-lg">Structures rattachées</p>
    <q-card>
      <ni-responsive-table :data="companyHoldings" :columns="columns" v-model:pagination="pagination">
        <template #header="{ props }">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style"
              :class="'table-actions-responsive'">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :style="col.style"
              :class="col.name">
              {{ col.value }}
            </q-td>
          </q-tr>
        </template>
      </ni-responsive-table>
      <q-card-actions align="right">
        <ni-button color="primary" icon="add" class="q-ml-sm" label="Rattacher une structure"
          @click="openCompanyLinkModal" />
      </q-card-actions>
    </q-card>

    <company-addition-modal v-model="companyLinkModal" :loading="modalLoading" @submit="linkCompanyToHolding"
      :validations="v$.newCompanyLink" @hide="resetCompanyLinkModal" v-model:selected-company="newCompanyLink"
      :company-options="companyOptions" />
  </div>
</template>

<script>
import { computed, toRefs, ref } from 'vue';
import { useStore } from 'vuex';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Companies from '@api/Companies';
import Holdings from '@api/Holdings';
import Button from '@components/Button';
import CompanyAdditionModal from '@components/courses/CompanyAdditionModal';
import ResponsiveTable from '@components/table/ResponsiveTable';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { formatAndSortOptions } from '@helpers/utils';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-responsive-table': ResponsiveTable,
    'company-addition-modal': CompanyAdditionModal,
    'ni-button': Button,
  },
  setup (props) {
    const { profileId } = toRefs(props);
    const $store = useStore();

    const columns = ref([
      {
        name: 'name',
        label: 'Nom',
        align: 'left',
        field: row => row.name,
      },
    ]);
    const pagination = ref({ rowsPerPage: 0, sortBy: 'name' });
    const companyOptions = ref([]);
    const companyLinkModal = ref(false);
    const newCompanyLink = ref('');
    const modalLoading = ref(false);

    const rules = { newCompanyLink: { required } };
    const v$ = useVuelidate(rules, { newCompanyLink });

    const holding = computed(() => $store.state.holding.holding);
    const companyHoldings = computed(() => holding.value.companyHoldingList.map(ch => ch.company));

    const refreshHolding = async () => {
      try {
        await $store.dispatch('holding/fetchHolding', { holdingId: profileId.value });
      } catch (e) {
        console.error(e);
      }
    };

    const openCompanyLinkModal = async () => {
      try {
        const companies = await Companies.list({ hasHolding: true });

        companyOptions.value = formatAndSortOptions(companies, 'name');
        companyLinkModal.value = true;
      } catch (e) {
        console.error(e);
        companyLinkModal.value = false;
        companyOptions.value = [];
      }
    };

    const resetCompanyLinkModal = () => {
      companyOptions.value = [];
      newCompanyLink.value = '';
      v$.value.newCompanyLink.$reset();
    };

    const linkCompanyToHolding = async () => {
      try {
        v$.value.newCompanyLink.$touch();
        if (v$.value.newCompanyLink.$error) return NotifyWarning('Une structure est requise.');

        modalLoading.value = true;
        await Holdings.update(
          holding.value._id,
          { company: newCompanyLink.value }
        );

        companyLinkModal.value = false;
        NotifyPositive('Rattachement à la société mère effectué.');

        await refreshHolding();
      } catch (e) {
        console.error(e);
        if (e.status === 403) return NotifyNegative('Cette structure est déjà rattachée à une société mère.');
        NotifyNegative('Erreur lors du rattachement à la structure.');
      } finally {
        modalLoading.value = false;
      }
    };

    const created = async () => {
      if (!holding.value) await refreshHolding();
    };

    created();

    return {
      // Data
      columns,
      pagination,
      companyOptions,
      companyLinkModal,
      newCompanyLink,
      modalLoading,
      // Computed
      holding,
      companyHoldings,
      v$,
      openCompanyLinkModal,
      resetCompanyLinkModal,
      linkCompanyToHolding,
    };
  },
};
</script>
