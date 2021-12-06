<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Répertoire apprenants" @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredLearners" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
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
    <learner-creation-modal v-model="learnerCreationModal" :new-user.sync="newLearner" @hide="resetLearnerCreationModal"
      :first-step="firstStep" @next-step="nextStepLearnerCreationModal"
      :validations="$v.newLearner" :loading="learnerCreationModalLoading" @submit="submitLearnerCreationModal" />
  </q-page>
</template>

<script>
import { mapGetters } from 'vuex';
import Users from '@api/Users';
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import { NotifyPositive, NotifyNegative } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { learnerDirectoryMixin } from '@mixins/learnerDirectoryMixin';
import { learnerCreationMixin } from '@mixins/learnerCreationMixin';

export default {
  metaInfo: { title: 'Répertoire apprenants' },
  name: 'LearnersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'learner-creation-modal': LearnerCreationModal,
  },
  mixins: [userMixin, learnerDirectoryMixin, learnerCreationMixin],
  async created () {
    await this.getLearnerList(this.company._id);
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
  },
  methods: {
    goToLearnerProfile (row) {
      this.$router.push({ name: 'ni courses learners info', params: { learnerId: row.learner._id } });
    },
    async updateLearner (userId) {
      try {
        await Users.updateById(userId, { company: this.company._id });
        NotifyPositive('Apprenant(e) ajouté(e) avec succès.');

        this.learnerCreationModal = false;
        await this.getLearnerList(this.company._id);
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de l\'apprenant(e).');
      }
    },
  },
};
</script>
