<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Répertoire apprenants" @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredLearners" :columns="columns" :loading="tableLoading" v-model:pagination="pagination">
      <template #body="{ col, props }">
        <router-link :to="goToLearnerProfile(props.row.learner)" class="directory-text">
          <q-item v-if="col.name === 'name'">
            <q-item-section avatar>
              <img class="avatar" :src="getAvatar(col.value.picture)">
            </q-item-section>
            <q-item-section>{{ col.value.fullName }}</q-item-section>
          </q-item>
          <q-item v-else class="row justify-center">{{ col.value }}</q-item>
        </router-link>
      </template>
    </ni-table-list>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une personne"
      @click="learnerCreationModal = true" :disable="tableLoading" />

      <!-- New learner modal -->
    <learner-creation-modal v-model="learnerCreationModal" v-model:new-user="newLearner" :first-step="firstStep"
      :loading="learnerCreationModalLoading" @submit="submitLearnerCreationModal" @hide="resetLearnerCreationModal"
      @next-step="nextStepLearnerCreationModal" :validations="learnerValidation.newLearner" disable-company
      :company-options="companyOptions" :disable-user-info="disableUserInfoEdition" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import { userMixin } from '@mixins/userMixin';
import { learnerDirectoryMixin } from '@mixins/learnerDirectoryMixin';
import { useLearnersCreation } from '@composables/learnersCreation';

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
    const company = computed(() => $store.getters['main/getCompany']);
    const companies = computed(() => [company.value._id]);
    const companyOptions = computed(() => [{ value: company.value._id, label: company.value.name }]);

    const refresh = async () => getLearnerList(company.value._id);

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

    onMounted(async () => { await refresh(); });

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
      // Computed
      filteredLearners,
      company,
      companyOptions,
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
  methods: {
    goToLearnerProfile (learner) {
      return learner._id ? { name: 'ni courses learners info', params: { learnerId: learner._id } } : {};
    },
  },
};
</script>
