<template>
  <q-page class="vendor-background" padding>
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
      :first-step="firstStep" @next-step="nextStepLearnerCreationModal" :company-options="companyOptions"
      :validations="$v.newLearner" :loading="learnerCreationModalLoading" @submit="submitLearnerCreationModal"
      display-company />
  </q-page>
</template>

<script>
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import Companies from '@api/Companies';
import { formatAndSortOptions } from '@helpers/utils';
import { userMixin } from '@mixins/userMixin';
import { learnerDirectoryMixin } from '@mixins/learnerDirectoryMixin';
import { learnerCreationMixin } from '@mixins/learnerCreationMixin';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';

export default {
  metaInfo: { title: 'Répertoire apprenants' },
  name: 'LearnersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'learner-creation-modal': LearnerCreationModal,
  },
  mixins: [userMixin, learnerDirectoryMixin, learnerCreationMixin],
  data () {
    return {
      companyOptions: [],
    };
  },
  async created () {
    await Promise.all([this.refreshCompanies(), this.getLearnerList()]);
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
    async submitLearnerCreationModal () {
      this.learnerCreationModalLoading = true;
      await this.createLearner();
      await this.getLearnerList(this.isClientInterface ? this.company._id : null);
      this.learnerCreationModal = false;
      this.learnerCreationModalLoading = false;
    },
  },
};
</script>
