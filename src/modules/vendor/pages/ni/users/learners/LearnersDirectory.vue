<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Répertoire apprenants" @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredLearners" :columns="columns" :loading="tableLoading" v-model:pagination="pagination"
      @go-to="goToLearnerProfile" :rows-per-page="[15, 50, 100, 200]">
      <template #body="{ col }">
        <q-item v-if="col.name === 'name'">
          <q-item-section avatar>
            <img class="avatar" :src="getAvatar(col.value.picture)">
          </q-item-section>
          <q-item-section>{{ col.value.fullName }}</q-item-section>
        </q-item>
        <template v-else>{{ col.value }}</template>
      </template>
    </ni-table-list>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une personne"
      @click="learnerCreationModal = true" :disable="tableLoading" />

    <!-- New learner modal -->
    <learner-creation-modal v-model="learnerCreationModal" v-model:new-user="newLearner" :first-step="firstStep"
      @next-step="nextStepLearnerCreationModal" @hide="resetLearnerCreationModal" :company-options="companyOptions"
      :validations="learnerValidation.newLearner" :loading="learnerCreationModalLoading" display-company
      @submit="submitLearnerCreationModal" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import Companies from '@api/Companies';
import Users from '@api/Users';
import { NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { formatAndSortOptions } from '@helpers/utils';
import { userMixin } from '@mixins/userMixin';
import { learnerDirectoryMixin } from '@mixins/learnerDirectoryMixin';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import { useLearners } from '@composables/learners';

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

    const refresh = async () => getLearnerList();

    const {
      searchStr,
      newLearner,
      learnerCreationModal,
      learnerCreationModalLoading,
      firstStep,
      learnerList,
      tableLoading,
      filteredLearners,
      learnerValidation,
      updateSearch,
      goToNextStep,
      getLearnerList,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
    } = useLearners(company, false, refresh);

    onMounted(async () => {
      await getLearnerList(company.value._id);
    });

    const nextStepLearnerCreationModal = async () => {
      try {
        learnerValidation.value.newLearner.$touch();
        if (learnerValidation.value.newLearner.local.email.$error) return NotifyWarning('Champ invalide.');

        learnerCreationModalLoading.value = true;
        const userInfo = await Users.exists({ email: newLearner.value.local.email });

        if (!userInfo.exists) return goToNextStep();

        NotifyWarning('L\'apprenant(e) est déjà ajouté(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de l\'apprenant(e).');
      } finally {
        learnerCreationModalLoading.value = false;
      }
    };

    return {
      searchStr,
      newLearner,
      firstStep,
      learnerList,
      tableLoading,
      learnerCreationModalLoading,
      learnerCreationModal,
      filteredLearners,
      learnerValidation,
      updateSearch,
      nextStepLearnerCreationModal,
      submitLearnerCreationModal,
      resetLearnerCreationModal,
    };
  },
  mixins: [userMixin, learnerDirectoryMixin],
  data () {
    return {
      companyOptions: [],
    };
  },
  async created () {
    await Promise.all([this.refreshCompanies()]);
  },
  methods: {
    goToLearnerProfile (row) {
      this.$router.push({ name: 'ni users learners info', params: { learnerId: row.learner._id } });
    },
    async refreshCompanies () {
      try {
        const companies = await Companies.list();
        this.companyOptions = formatAndSortOptions(companies, 'name');
      } catch (e) {
        console.error(e);
        this.companyOptions = [];
      }
    },
  },
};
</script>
