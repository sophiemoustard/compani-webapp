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
    <learner-creation-modal v-model="learnerCreationModal" :new-user.sync="newLearner" @hide="resetAddLearnerForm"
      :first-step="firstStep" @next-step="nextStepLearnerCreationModal"
      :validations="$v.newLearner" :loading="learnerCreationModalLoading" @submit="createLearner" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapGetters } from 'vuex';
import Users from '@api/Users';
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import {
  formatPhoneForPayload,
  removeEmptyProps,
  clear,
} from '@helpers/utils';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';
import { learnerDirectoryMixin } from '@mixins/learnerDirectoryMixin';

export default {
  metaInfo: { title: 'Répertoire apprenants' },
  name: 'LearnersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'learner-creation-modal': LearnerCreationModal,
  },
  mixins: [userMixin, learnerDirectoryMixin],
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
  },
  async created () {
    await this.getLearnerList(this.company._id);
  },
  methods: {
    resetAddLearnerForm () {
      this.firstStep = true;
      this.newLearner = { ...clear(this.newLearner) };
      this.$v.newLearner.$reset();
    },
    async nextStepLearnerCreationModal () {
      try {
        this.$v.newLearner.$touch();
        if (this.$v.newLearner.local.email.$error) return NotifyWarning('Champ invalide.');

        this.learnerCreationModalLoading = true;
        const userInfo = await Users.exists({ email: this.newLearner.local.email });

        if (!userInfo.exists) return this.goToCreationStep();
        if (!userInfo.user.company && userInfo.user._id) return this.updateLearner(userInfo.user._id);

        return get(userInfo, 'user.company') === this.company._id
          ? NotifyWarning('L\'apprenant(e) est déjà ajouté(e).')
          : NotifyNegative('L\'apprenant(e) n\'est pas relié(e) à cette structure.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de l\'apprenant(e).');
      } finally {
        this.learnerCreationModalLoading = false;
      }
    },
    goToCreationStep () {
      this.firstStep = false;
      this.$v.newLearner.$reset();
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
    formatUserPayload () {
      const payload = removeEmptyProps(this.newLearner);
      if (get(payload, 'contact.phone')) payload.contact.phone = formatPhoneForPayload(this.newLearner.contact.phone);

      return ({ ...payload, company: this.company._id });
    },
    async createLearner () {
      try {
        this.learnerCreationModalLoading = true;
        this.$v.newLearner.$touch();
        if (this.$v.newLearner.$error) return NotifyWarning('Champ(s) invalide(s).');

        const payload = await this.formatUserPayload();
        await Users.create(payload);
        NotifyPositive('Apprenant(e) ajouté(e) avec succès.');

        await this.sendWelcome();

        this.learnerCreationModal = false;
        await this.getLearnerList(this.company._id);
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de l\' apprenant(e).');
      } finally {
        this.learnerCreationModalLoading = false;
      }
    },
  },
};
</script>
