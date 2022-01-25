<template>
  <q-page class="client-background" padding>
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
      :loading="learnerCreationModalLoading" @submit="submitLearnerCreationModal" @hide="resetLearnerCreationModal"
      @next-step="nextStepLearnerCreationModal" :validations="learnerValidation.newLearner" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import { computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import get from 'lodash/get';
import Users from '@api/Users';
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { learnerDirectoryMixin } from '@mixins/learnerDirectoryMixin';
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

    const refresh = async () => getLearnerList(company.value._id);

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
    } = useLearners(refresh, true, company);

    onMounted(async () => { await refresh(); });

    const nextStepLearnerCreationModal = async () => {
      try {
        learnerValidation.value.newLearner.$touch();
        if (learnerValidation.value.newLearner.local.email.$error) return NotifyWarning('Champ invalide.');

        learnerCreationModalLoading.value = true;
        const userInfo = await Users.exists({ email: newLearner.value.local.email });

        if (!userInfo.exists) return goToNextStep();

        if (!get(userInfo, 'user.company') && userInfo.user._id) return updateLearner(userInfo.user._id);
        if (get(userInfo, 'user.company') !== company.value._id) {
          return NotifyNegative('L\'apprenant(e) n\'est pas relié(e) à cette structure.');
        }

        NotifyWarning('L\'apprenant(e) est déjà ajouté(e).');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de l\'apprenant(e).');
      } finally {
        learnerCreationModalLoading.value = false;
      }
    };

    const updateLearner = async (userId) => {
      try {
        await Users.updateById(userId, { company: company.value._id });
        NotifyPositive('Apprenant(e) ajouté(e) avec succès.');

        learnerCreationModal.value = false;
        await getLearnerList(company.value._id);
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de l\'apprenant(e).');
      }
    };

    return {
      // Data
      searchStr,
      newLearner,
      firstStep,
      learnerList,
      tableLoading,
      learnerCreationModalLoading,
      learnerCreationModal,
      // Computed
      filteredLearners,
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
    goToLearnerProfile (row) {
      this.$router.push({ name: 'ni courses learners info', params: { learnerId: row.learner._id } });
    },
  },
};
</script>
