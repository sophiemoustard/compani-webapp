<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Répertoire formateurs" search-placeholder="Rechercher un formateur"
      @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredTrainers" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      @goTo="goToTrainerProfile" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un formateur"
      @click="trainerCreationModal = true" :disable="tableLoading" />

    <!-- Trainer creation modal -->
    <ni-modal v-model="trainerCreationModal" @hide="resetCreationModal">
      <template slot="title">
        Créer un nouveau <span class="text-weight-bold">formateur</span>
      </template>
      <ni-input :disable="!firstStep" in-modal v-model.trim="newTrainer.local.email" required-field
        @blur="$v.newTrainer.local.email.$touch" caption="Email" :error="$v.newTrainer.local.email.$error"
        :error-label="emailError($v.newTrainer)" :last="firstStep" />
      <template v-if="!firstStep">
        <ni-input in-modal v-model.trim="newTrainer.identity.firstname" caption="Prénom" />
        <ni-input in-modal v-model.trim="newTrainer.identity.lastname" :error="$v.newTrainer.identity.lastname.$error"
          @blur="$v.newTrainer.identity.lastname.$touch" required-field caption="Nom" last />
      </template>
      <template slot="footer">
        <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary"
          :loading="modalLoading" icon-right="add" @click="nextStep" />
        <q-btn v-else no-caps class="full-width modal-btn" label="Ajouter le formateur" color="primary"
          :loading="modalLoading" icon-right="add" @click="createTrainer" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import pick from 'lodash/pick';
import get from 'lodash/get';
import Users from '@api/Users';
import Roles from '@api/Roles';
import Email from '@api/Email';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { formatIdentity } from '@helpers/utils';
import { TRAINER } from '@data/constants';
import { userMixin } from '@mixins/userMixin';

export default {
  metaInfo: { title: 'Répertoire formateurs' },
  name: 'TrainersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'ni-modal': Modal,
    'ni-input': Input,
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
    }
  },
  validations () {
    return { newTrainer: { ...pick(this.userValidation, ['identity.lastname', 'local.email']) } };
  },
  async mounted () {
    await this.refreshTrainers();
  },
  computed: {
    filteredTrainers () {
      return this.trainers.filter(trainer => trainer.name.match(new RegExp(this.searchStr, 'i')));
    },
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
    async refreshTrainers () {
      try {
        this.tableLoading = true;
        const trainers = await Users.list({ role: [TRAINER] });
        this.trainers = trainers.map(trainer => ({ ...trainer, name: formatIdentity(trainer.identity, 'FL') }))
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
        NotifyPositive('Formateur créé.')

        await Email.sendWelcome({ email: this.newTrainer.local.email, type: TRAINER });
        NotifyPositive('Email envoyé');
        await this.refreshTrainers();
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative('Formateur déjà existant.');
        NotifyNegative('Erreur lors de la création du formateur.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
}
</script>
