<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Répertoire apprenants" @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredLearners" :columns="columns" :loading="tableLoading" v-model:pagination="pagination"
      :path="path">
      <template #body="{ col }">
          <q-item v-if="col.name === 'name'">
            <q-item-section avatar>
              <img class="avatar" :src="getAvatar(col.value.picture)">
            </q-item-section>
            <q-item-section>{{ col.value.fullName }}</q-item-section>
          </q-item>
          <q-item v-else class="row justify-center">{{ col.value }}</q-item>
      </template>
    </ni-table-list>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une personne"
      @click="learnerCreationModal = true" :disable="tableLoading" />

      <!-- New learner modal -->
    <learner-creation-modal v-model="learnerCreationModal" v-model:new-user="newLearner" :first-step="firstStep"
      :loading="learnerCreationModalLoading" @submit="submitLearnerCreationModal" @hide="resetLearnerCreationModal"
      @next-step="nextStepLearnerCreationModal" :validations="learnerValidation.newLearner"
      :company-options="companyOptions" :disable-user-info="disableUserInfoEdition" :disable-company="disableCompany" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { useMeta } from 'quasar';
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import Companies from '@api/Companies';
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import { NotifyNegative } from '@components/popup/notify';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import { userMixin } from '@mixins/userMixin';
import { learnerDirectoryMixin } from '@mixins/learnerDirectoryMixin';
import { useLearnersCreation } from '@composables/learnersCreation';
import { formatAndSortOptions } from '@helpers/utils';

export default {
  name: 'LearnersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'learner-creation-modal': LearnerCreationModal,
  },
  setup () {
    const metaInfo = { title: 'Répertoire apprenants' };
    useMeta(metaInfo);

    const $store = useStore();
    const holdingCompanies = ref([]);
    const loggedUser = computed(() => $store.state.main.loggedUser);
    const company = computed(() => get(loggedUser.value, 'company'));
    const companies = computed(() => (
      get(loggedUser.value, 'role.holding')
        ? loggedUser.value.holding.companies
        : [company.value._id]
    ));
    const disableCompany = computed(() => !get(loggedUser.value, 'role.holding'));
    const companyOptions = computed(() => (
      get(loggedUser.value, 'role.holding')
        ? holdingCompanies.value
        : [{ value: company.value._id, label: company.value.name }]
    ));
    const path = { name: 'ni courses learners info', params: 'learnerId' };
    const refresh = async () => getLearnerList();

    const {
      searchStr,
      newLearner,
      learnerCreationModal,
      learnerCreationModalLoading,
      disableUserInfoEdition,
      firstStep,
      learnerList,
      tableLoading,
      filteredLearners,
      learnerValidation,
      updateSearch,
      nextStepLearnerCreationModal,
      getLearnerList,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
    } = useLearnersCreation(refresh, true, true, companies);

    const getHoldingCompanies = async () => {
      try {
        const companyList = await Companies.list({ holding: loggedUser.value.holding._id });
        holdingCompanies.value = formatAndSortOptions(companyList, 'name');
      } catch (error) {
        holdingCompanies.value = [];
        NotifyNegative('Erreur lors de la récupération des structures.');
      }
    };

    const created = async () => {
      await refresh();
      if (get(loggedUser.value, 'role.holding')) await getHoldingCompanies();
    };

    created();

    return {
      // Data
      searchStr,
      newLearner,
      firstStep,
      learnerList,
      tableLoading,
      learnerCreationModalLoading,
      learnerCreationModal,
      disableUserInfoEdition,
      path,
      // Computed
      filteredLearners,
      company,
      companyOptions,
      disableCompany,
      // Validations
      learnerValidation,
      // Methods
      updateSearch,
      nextStepLearnerCreationModal,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
    };
  },
  mixins: [learnerDirectoryMixin, userMixin],
};
</script>
