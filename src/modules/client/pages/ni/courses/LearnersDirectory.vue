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
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une personne"
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
import { formatIdentity, removeDiacritics, sortStrings, clear } from '@helpers/utils';
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
      newLearner: {
        identity: {
          firstname: '',
          lastname: '',
        },
        contact: { phone: '' },
        local: { email: '' },
      },
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
        this.$v.newUser.$touch();
        if (this.$v.newUser.local.email.$error) return NotifyWarning('Champ(s) invalide(s).');

        this.loading = true;
        const userExistsInfo = await Users.exists({ email: this.newUser.local.email });

        if (userExistsInfo.exists) {
          const hasPermissionOnUserInfo = !!userExistsInfo.user._id;
          const userHasValidCompany = !get(userExistsInfo, 'user.company') ||
             get(userExistsInfo, 'user.company') === this.company._id;
          const userHasClientRole = !!get(userExistsInfo, 'user.role.client');

          if (hasPermissionOnUserInfo && userHasValidCompany && !userHasClientRole) {
            this.fetchedUser = await Users.getById(userExistsInfo.user._id);
            this.fillNewUser(this.fetchedUser);
          } else {
            const otherCompanyEmail = !userHasValidCompany || !hasPermissionOnUserInfo;
            if (otherCompanyEmail) return NotifyNegative('Email relié à une autre structure.');
            if (userHasClientRole) return NotifyNegative('Email déjà existant.');
          }
        }

        this.firstStep = false;
        this.$v.newUser.$reset();
      } catch (e) {
        NotifyNegative('Erreur lors de la création de la fiche auxiliaire.');
      } finally {
        this.loading = false;
      }
    },
    async addLearner () {
      let editedUser = {};
      try {
        this.loading = true;
        this.$v.newUser.$touch();
        const isValid = await this.waitForFormValidation(this.$v.newUser);
        if (!isValid) return NotifyWarning('Champ(s) invalide(s)');

        const folderId = get(this.company, 'auxiliariesFolderId', null);
        if (!folderId) return NotifyNegative('Erreur lors de la création de la fiche auxiliaire.');

        const payload = await this.formatUserPayload();

        if (this.fetchedUser._id) {
          await Users.updateById(this.fetchedUser._id, payload);
          editedUser = { contact: { phone: get(payload, 'contact.phone') || '' }, ...this.fetchedUser };
        } else {
          editedUser = await Users.create(payload);
        }
        await Users.createDriveFolder(editedUser._id, { parentFolderId: folderId });
        await this.getUserList();
        NotifyPositive('Fiche auxiliaire créée');

        this.auxiliaryCreationModal = false;
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative('Email déjà existant.');
        NotifyNegative('Erreur lors de la création de la fiche auxiliaire.');
      } finally {
        this.loading = false;
      }
      try {
        if (this.sendWelcomeMsg) await this.sendSMS(editedUser);
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 400) return NotifyNegative('Le numéro entré ne recoit pas les SMS');
        NotifyNegative('Erreur lors de l\'envoi de SMS');
      }
    },
  },
};
</script>
