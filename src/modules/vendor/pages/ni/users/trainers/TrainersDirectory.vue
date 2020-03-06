<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire formateurs" search-placeholder="Rechercher un formateur"
      @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredTrainers" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"/>
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un formateur"
      @click="trainerCreationModal = true" />

    <!-- Trainer creation modal -->
    <ni-modal v-model="trainerCreationModal" @hide="resetCreationModal">
      <template slot="title">
        Créer un nouveau <span class="text-weight-bold">formateur</span>
      </template>
      <ni-input in-modal v-model.trim="newTrainer.identity.lastname" :error="$v.newTrainer.identity.lastname.$error"
        @blur="$v.newTrainer.identity.lastname.$touch" required-field caption="Nom" />
      <ni-input in-modal v-model.trim="newTrainer.identity.firstname" caption="Prénom" />
      <ni-input in-modal v-model.trim="newTrainer.local.email" :error="$v.newTrainer.local.email.$error"
        @blur="$v.newTrainer.local.email.$touch" required-field caption="Email" />
      <ni-option-group v-model="newTrainer.status" type="radio" :options="trainerTypeOptions" inline caption="Statut"
        required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter le formateur" color="primary" :loading="modalLoading"
          icon-right="add" @click="createTrainer" :disable="$v.newTrainer.$anyError || !$v.newTrainer.$anyDirty" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import randomize from 'randomatic';
import { required } from 'vuelidate/lib/validators';
import pick from 'lodash/pick';
import Users from '@api/Users';
import Roles from '@api/Roles';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import OptionGroup from '@components/form/OptionGroup';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';
import { formatIdentity } from '@helpers/utils';
import { TRAINER, INTERNAL, EXTERNAL } from '@data/constants';
import { userMixin } from '@mixins/userMixin';

export default {
  metaInfo: { title: 'Répertoire formateurs' },
  name: 'TrainersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-option-group': OptionGroup,
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
      newTrainer: { identity: { lastname: '', firstname: '' }, local: { email: '' }, status: INTERNAL },
      modalLoading: false,
    }
  },
  validations () {
    return { newTrainer: { ...pick(this.userValidation, ['identity.lastname', 'local.email']), status: { required } } };
  },
  async mounted () {
    await this.refreshTrainers();
  },
  computed: {
    filteredTrainers () {
      return this.trainers.filter(trainer => trainer.name.match(new RegExp(this.searchStr, 'i')));
    },
    trainerTypeOptions () {
      return [{ label: 'interne', value: INTERNAL }, { label: 'externe', value: EXTERNAL }]
    },
  },
  methods: {
    resetCreationModal () {
      this.newTrainer = { identity: { lastname: '', firstname: '' }, local: { email: '' }, status: INTERNAL };
      this.$v.newTrainer.$reset();
    },
    updateSearch (value) {
      this.searchStr = value;
    },
    async refreshTrainers () {
      try {
        this.tableLoading = true;
        const trainers = await Users.list({ role: [TRAINER] });
        this.trainers = trainers.map(trainer => ({ ...trainer, name: formatIdentity(trainer.identity, 'FL') }))
      } catch (e) {
        console.error(e);
        this.trainers = [];
        NotifyNegative('Erreur lors de la récupération des formateurs');
      } finally {
        this.tableLoading = false;
      }
    },
    async createTrainer () {
      try {
        this.modalLoading = true;

        const roles = await Roles.list({ name: TRAINER });
        if (roles.length === 0) throw new Error('Role not found');

        this.newTrainer.local.password = randomize('*', 10);
        await Users.create({ ...this.newTrainer, role: roles[0]._id });

        this.trainerCreationModal = false;
        NotifyPositive('Formateur créé.')
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
