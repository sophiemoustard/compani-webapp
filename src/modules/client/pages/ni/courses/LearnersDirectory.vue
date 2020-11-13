<template>
  <q-page class="client-background" padding>
    <ni-directory-header title="Répertoire apprenants" @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredLearners" :columns="columns" :loading="tableLoading" :pagination.sync="pagination">
      <template v-slot:body="{ col }">
        <q-item v-if="col.name === 'name'">
          <q-item-section avatar>
            <img class="avatar" :src="getAvatar(col.value.picture)">
          </q-item-section>
          <q-item-section>{{ col.value.fullName }}</q-item-section>
        </q-item>
        <template v-else>{{ col.value }}</template>
      </template>
    </ni-table-list>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un apprenant"
      @click="learnerCreationModal = true" :disable="tableLoading" />

      <!-- New learner modal -->
    <learner-creation-modal v-model="learnerCreationModal" :new-user="newLearner" @hide="resetAddLearnerForm"
      :first-step="firstStep" :identity-step="addNewLearnerIdentityStep" @next-step="nextStepLearnerCreationModal"
      :validations="$v.newLearner" :loading="learnerCreationModalLoading" @submit="addLearner" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapGetters } from 'vuex';
import Users from '@api/Users';
import escapeRegExp from 'lodash/escapeRegExp';
import TableList from '@components/table/TableList';
import DirectoryHeader from '@components/DirectoryHeader';
import LearnerCreationModal from '@components/courses/LearnerCreationModal';
import { frPhoneNumber } from '@helpers/vuelidateCustomVal';
import { required, requiredIf, email } from 'vuelidate/lib/validators';
import { DEFAULT_AVATAR } from '@data/constants';
import {
  formatIdentity,
  formatPhoneForPayload,
  removeDiacritics,
  removeEmptyProps,
  sortStrings,
  clear,
} from '@helpers/utils';
import { NotifyPositive, NotifyNegative, NotifyWarning } from '@components/popup/notify';
import { userMixin } from '@mixins/userMixin';

export default {
  metaInfo: { title: 'Répertoire apprenants' },
  name: 'LearnersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'learner-creation-modal': LearnerCreationModal,
  },
  mixins: [userMixin],
  data () {
    return {
      tableLoading: false,
      loading: false,
      learnerList: [],
      searchStr: '',
      pagination: { sortBy: 'name', descending: false, page: 1, rowsPerPage: 15 },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          field: row => row.learner,
          align: 'left',
          sortable: true,
          sort: (a, b) => sortStrings(a.lastname, b.lastname),
          style: 'min-width: 200px; width: 35%',
        },
        {
          name: 'blendedCoursesCount',
          label: 'Formations suivies',
          field: 'blendedCoursesCount',
          align: 'center',
          sortable: true,
          style: 'min-width: 110px; width: 15%',
          sort: (a, b) => b - a,
        },
      ],
      learnerCreationModal: false,
      learnerCreationModalLoading: false,
      firstStep: true,
      addNewLearnerIdentityStep: false,
      newLearner: { identity: { firstname: '', lastname: '' }, contact: { phone: '' }, local: { email: '' } },
    };
  },
  computed: {
    ...mapGetters({ company: 'main/getCompany' }),
    filteredLearners () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.learnerList.filter(user => user.learner.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    },
  },
  async created () {
    await this.getLearnerList();
  },
  validations () {
    return {
      newLearner: {
        identity: { lastname: { required: requiredIf(this.addNewLearnerIdentityStep) } },
        local: { email: { required, email } },
        contact: { phone: { frPhoneNumber } },
      },
    };
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    formatRow (user) {
      const formattedName = formatIdentity(user.identity, 'FL');

      return {
        learner: {
          _id: user._id,
          fullName: formattedName,
          lastname: user.identity.lastname,
          picture: user.picture ? user.picture.link : null,
          noDiacriticsName: removeDiacritics(formattedName),
        },
        company: user.company ? user.company.name : 'N/A',
        blendedCoursesCount: user.blendedCoursesCount,
      };
    },
    async getLearnerList () {
      try {
        this.tableLoading = true;
        const learners = await Users.learnerList({ company: this.company._id });
        this.learnerList = Object.freeze(learners.map(this.formatRow));
      } catch (e) {
        console.error(e);
        this.learnerList = [];
      } finally {
        this.tableLoading = false;
      }
    },
    getAvatar (link) {
      return link || DEFAULT_AVATAR;
    },
    resetAddLearnerForm () {
      this.firstStep = true;
      this.addNewLearnerIdentityStep = false;
      this.newLearner = { ...clear(this.newLearner) };
      this.$v.newLearner.$reset();
    },
    async nextStepLearnerCreationModal () {
      try {
        this.$v.newLearner.$touch();
        if (this.$v.newLearner.local.email.$error) return NotifyWarning('Champ invalide.');

        this.learnerCreationModalLoading = true;
        const userInfo = await Users.exists({ email: this.newLearner.local.email });

        if (userInfo.exists) {
          if (!userInfo.user.company) {
            await Users.updateById(userInfo.user._id, { company: this.company._id });
            await this.addLearner();
          } else if (userInfo.user.company === this.company._id) {
            return NotifyWarning('L\'apprenant a déjà été ajouté.');
          } else return NotifyNegative('L\'apprenant n\'est pas relié à cette structure.');
        } else this.addNewLearnerIdentityStep = true;
        this.firstStep = false;
        this.$v.newLearner.$reset();
      } catch (e) {
        NotifyNegative('Erreur lors de l\'ajout de l\'apprenant.');
      } finally {
        this.learnerCreationModalLoading = false;
      }
    },
    formatUserPayload () {
      const payload = removeEmptyProps(this.newLearner);
      if (get(payload, 'contact.phone')) payload.contact.phone = formatPhoneForPayload(this.newLearner.contact.phone);
      return ({ ...payload, company: this.company._id });
    },
    async addLearner () {
      try {
        this.learnerCreationModalLoading = true;
        if (!this.firstStep) {
          this.$v.newLearner.$touch();
          if (this.$v.newLearner.$error) return NotifyWarning('Champ(s) invalide(s).');
          const payload = await this.formatUserPayload();
          await Users.create(payload);
        }
        NotifyPositive('Apprenant ajouté avec succès.');

        this.learnerCreationModal = false;
        await this.getLearnerList();
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyNegative(e.data.message);
        NotifyNegative('Erreur lors de l\'ajout de l\' apprenant.');
      } finally {
        this.learnerCreationModalLoading = false;
      }
    },
  },
};
</script>
