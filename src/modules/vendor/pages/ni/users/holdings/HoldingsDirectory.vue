<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Répertoire sociétés mères" search-placeholder="Rechercher une société mère"
      @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredHoldings" :columns="columns" :loading="tableLoading" v-model:pagination="pagination"
      :path="path" />
    <ni-primary-button icon="add" label="Ajouter une société mère" @click="holdingCreationModal = true"
      :disable="tableLoading" :mode="FLOATING" />

    <holding-creation-modal v-model="holdingCreationModal" v-model:new-holding="newHolding" :validations="v$.newHolding"
      :loading="modalLoading" @hide="resetCreationModal" @submit="createHolding" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import escapeRegExp from 'lodash/escapeRegExp';
import { computed, ref } from 'vue';
import Holdings from '@api/Holdings';
import PrimaryButton from '@components/PrimaryButton';
import DirectoryHeader from '@components/DirectoryHeader';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import TableList from '@components/table/TableList';
import { FLOATING } from '@data/constants';
import { removeDiacritics, removeEmptyProps } from '@helpers/utils';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import HoldingCreationModal from 'src/modules/vendor/components/holdings/HoldingCreationModal';

export default {
  name: 'HoldingsDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'holding-creation-modal': HoldingCreationModal,
    'ni-primary-button': PrimaryButton,
  },
  setup () {
    const metaInfo = { title: 'Répertoire sociétés mères' };
    useMeta(metaInfo);

    const holdings = ref([]);
    const tableLoading = ref(false);
    const columns = [
      { name: 'name', label: 'Nom', align: 'left', field: 'name', sortable: true },
      {
        name: 'companiesCount',
        label: 'Nombre de structures',
        align: 'center',
        style: 'width: 20%',
        field: 'companies',
        format: value => value.length || '0',
        sortable: true,
        sort: (a, b) => a.length - b.length,
      },
    ];
    const pagination = ref({ sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 });
    const searchStr = ref('');
    const holdingCreationModal = ref(false);
    const newHolding = ref({ name: '', address: '' });
    const modalLoading = ref(false);
    const path = { name: 'ni users holdings info', params: 'holdingId' };

    const filteredHoldings = computed(() => {
      const formattedString = escapeRegExp(removeDiacritics(searchStr.value));
      return holdings.value.filter(holding => holding.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    });

    const rules = computed(() => ({
      newHolding: {
        name: { required },
      },
    }));

    const v$ = useVuelidate(rules, { newHolding });

    const updateSearch = (value) => {
      searchStr.value = value;
    };

    const refreshHoldings = async () => {
      try {
        tableLoading.value = true;
        const holdingList = await Holdings.list();

        holdings.value = holdingList.map(h => ({ ...h, noDiacriticsName: removeDiacritics(h.name) }));
      } catch (e) {
        console.error(e);
        holdings.value = [];
        NotifyNegative('Erreur lors de la récupération des sociétés mères.');
      } finally {
        tableLoading.value = false;
      }
    };

    const resetCreationModal = () => {
      newHolding.value = { name: '', address: '' };
      v$.value.newHolding.$reset();
    };

    const createHolding = async () => {
      try {
        v$.value.newHolding.$touch();
        if (v$.value.newHolding.$error) return NotifyWarning('Champ(s) invalide(s)');
        modalLoading.value = true;
        const payload = removeEmptyProps(newHolding.value);
        await Holdings.create(payload);

        holdingCreationModal.value = false;
        NotifyPositive('Société mère créée.');
        await refreshHoldings();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de la création de la structure.');
      } finally {
        modalLoading.value = false;
      }
    };

    const created = async () => {
      await refreshHoldings();
    };

    created();

    return {
      // Data
      searchStr,
      columns,
      tableLoading,
      pagination,
      holdingCreationModal,
      modalLoading,
      newHolding,
      path,
      FLOATING,
      // Computed
      filteredHoldings,
      v$,
      // Methods
      updateSearch,
      resetCreationModal,
      createHolding,
    };
  },

};
</script>
