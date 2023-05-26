<template>
  <div v-if="holding">
    <p class="text-weight-bold q-mt-lg">Structures rattachées</p>
    <q-card>
      <ni-simple-table :data="companyHoldings" :columns="columns" v-model:pagination="pagination" class="q-px-md">
        <template #header="{ props }">
          <q-tr :props="props">
            <q-th v-for="col in props.cols" :key="col.name" :props="props" :style="col.style"
              :class="'bg-white'">
              {{ col.label }}
            </q-th>
          </q-tr>
        </template>
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :style="col.style"
              :class="col.name">
              <div @click="goToCompanyProfile(props.row)"
                :class="['ellipsis', 'clickable-name cursor-pointer']">
                {{ col.value }}
              </div>
            </q-td>
          </q-tr>
        </template>
      </ni-simple-table>
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
import { useRouter } from 'vue-router';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import Companies from '@api/Companies';
import Holdings from '@api/Holdings';
import Button from '@components/Button';
import CompanyAdditionModal from '@components/courses/CompanyAdditionModal';
import SimpleTable from '@components/table/SimpleTable';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { formatAndSortOptions } from '@helpers/utils';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-simple-table': SimpleTable,
    'company-addition-modal': CompanyAdditionModal,
    'ni-button': Button,
  },
  setup (props) {
    const { profileId } = toRefs(props);
    const $store = useStore();
    const $router = useRouter();

    const columns = ref([{ name: 'name', label: 'Nom', align: 'left', field: 'name', sortable: true }]);
    const pagination = ref({ sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 });
    const companyOptions = ref([]);
    const companyLinkModal = ref(false);
    const newCompanyLink = ref('');
    const modalLoading = ref(false);

    const rules = { newCompanyLink: { required } };
    const v$ = useVuelidate(rules, { newCompanyLink });

    const holding = computed(() => $store.state.holding.holding);
    const companyHoldings = computed(() => holding.value.companyHoldings.map(ch => ch.company));

    const refreshHolding = async () => {
      try {
        await $store.dispatch('holding/fetchHolding', { holdingId: profileId.value });
      } catch (e) {
        console.error(e);
      }
    };

    const openCompanyLinkModal = async () => {
      try {
        const companies = await Companies.list({ noHolding: true });

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
        await Holdings.update(holding.value._id, { company: newCompanyLink.value });

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

    const goToCompanyProfile = (row) => {
      $router.push({ name: 'ni users companies info', params: { companyId: row._id } });
    };

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
      goToCompanyProfile,
    };
  },
};
</script>
