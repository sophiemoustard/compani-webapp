<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Répertoire formateurs" search-placeholder="Rechercher un formateur"
      @update-search="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredTrainers" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      @go-to="goToTrainerProfile" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un formateur"
      @click="trainerCreationModal = true" :disable="tableLoading" />

    <trainer-creation-modal v-model="trainerCreationModal" @hide="resetCreationModal" @submit="createTrainer"
      :new-trainer="newTrainer" :validations="$v.newTrainer" :loading="modalLoading" @go-to-next-step="nextStep"
      :email-error="emailError($v.newTrainer)" :first-step="firstStep" />
</q-page>
</template>

<script>
import pick from 'lodash/pick';
import get from 'lodash/get';
import escapeRegExp from 'lodash/escapeRegExp';
import Users from '@api/Users';
import Roles from '@api/Roles';
import Email from '@api/Email';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { formatIdentity, removeDiacritics } from '@helpers/utils';
import { TRAINER } from '@data/constants';
import { userMixin } from '@mixins/userMixin';
import TrainerCreationModal from 'src/modules/vendor/components/trainers/TrainerCreationModal';

export default {
  metaInfo: { title: 'Répertoire formateurs' },
  name: 'TrainersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'trainer-creation-modal': TrainerCreationModal,
  },
  mixins: [userMixin],
  data () {
    return {
      trainers: [],
      tableLoading: false,
      columns: [{ name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true }],
      pagination: { sortBy: 'name', descending: false, page: 1, rowsPerPage: 15 },
      searchStr: '',
      trainerCreationModal: false,
      newTrainer: { identity: { lastname: '', firstname: '' }, local: { email: '' } },
      modalLoading: false,
      firstStep: true,
    };
  },
  validations () {
    return { newTrainer: { ...pick(this.userValidation, ['identity.lastname', 'local.email']) } };
  },
  computed: {
    filteredTrainers () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.trainers.filter(trainer => trainer.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    },
  },
  async created () {
    await this.refreshTrainers();
  },
  methods: {
    async nextStep () {
      try {
        this.$v.newTrainer.local.email.$touch();
        if (this.$v.newTrainer.local.email.$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        this.modalLoading = true;
        const userInfo = await Users.exists({ email: this.newTrainer.local.email });

        if (userInfo.exists && get(userInfo, 'user.role.vendor')) {
          NotifyNegative('Utilisateur déjà existant');
        } else if (userInfo.exists) {
          const roles = await Roles.list({ name: TRAINER });
          if (roles.length === 0) throw new Error('Role not found');
          await Users.updateById(userInfo.user._id, { role: roles[0]._id });
          NotifyPositive('Formateur créé');
          await this.refreshTrainers();
          this.resetCreationModal();
          this.trainerCreationModal = false;
        } else {
          this.firstStep = false;
        }
      } catch (e) {
        NotifyNegative('Erreur lors de la création du formateur');
        this.resetCreationModal();
      } finally {
        this.modalLoading = false;
      }
    },
    resetCreationModal () {
      this.firstStep = true;
      this.newTrainer = { identity: { lastname: '', firstname: '' }, local: { email: '' } };
      this.$v.newTrainer.$reset();
    },
    updateSearch (value) {
      this.searchStr = value;
    },
    goToTrainerProfile (row) {
      this.$router.push({ name: 'ni users trainers info', params: { trainerId: row._id } });
    },
    formatTrainer (trainer) {
      const formattedName = formatIdentity(trainer.identity, 'FL');

      return {
        ...trainer,
        name: formattedName,
        noDiacriticsName: removeDiacritics(formattedName),
      };
    },
    async refreshTrainers () {
      try {
        this.tableLoading = true;
        const trainers = await Users.list({ role: [TRAINER] });

        this.trainers = trainers.map(trainer => this.formatTrainer(trainer));
      } catch (e) {
        console.error(e);
        this.trainers = [];
        NotifyNegative('Erreur lors de la récupération des formateurs.');
      } finally {
        this.tableLoading = false;
      }
    },
    async createTrainer () {
      try {
        this.$v.newTrainer.$touch();
        if (this.$v.newTrainer.$error) {
          return NotifyWarning('Champ(s) invalide(s)');
        }

        this.modalLoading = true;

        const roles = await Roles.list({ name: TRAINER });
        if (roles.length === 0) throw new Error('Role not found');

        await Users.create({ ...this.newTrainer, role: roles[0]._id });
        this.trainerCreationModal = false;
        NotifyPositive('Formateur créé.');

        await this.sendWelcome();
        await this.refreshTrainers();
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative('Formateur déjà existant.');
        NotifyNegative('Erreur lors de la création du formateur.');
      } finally {
        this.modalLoading = false;
      }
    },
    async sendWelcome () {
      try {
        await Email.sendWelcome({ email: this.newTrainer.local.email, type: TRAINER });
        NotifyPositive('Email envoyé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'envoi du mail.');
      }
    },
  },
};
</script>
