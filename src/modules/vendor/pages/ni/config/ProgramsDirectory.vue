<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Catalogue" search-placeholder="Rechercher un programme"
      @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredPrograms" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      @goTo="goToProgramProfile" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un programme"
      @click="programCreationModal = true" :disable="tableLoading" />

    <!-- Program creation modal -->
    <ni-modal v-model="programCreationModal" @hide="resetCreationModal">
      <template slot="title">
        Créer un nouveau <span class="text-weight-bold">programme</span>
      </template>
      <ni-input in-modal v-model.trim="newProgram.name" :error="$v.newProgram.name.$error"
        @blur="$v.newProgram.name.$touch" required-field caption="Nom" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer le programme" color="primary" :loading="modalLoading"
          icon-right="add" @click="createProgram" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Programs from '@api/Programs';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { ON_SITE, E_LEARNING } from '@data/constants';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'ProgramDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'ni-modal': Modal,
    'ni-input': Input,
  },
  data () {
    return {
      tableLoading: false,
      columns: [
        { name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true },
        {
          name: 'eLearningStepsCount',
          label: 'Étapes e-learning',
          field: 'steps',
          format: value => this.countStepsByType(E_LEARNING, value),
          align: 'center',
        },
        {
          name: 'onSiteStepsCount',
          label: 'Étapes présentielles',
          field: 'steps',
          format: value => this.countStepsByType(ON_SITE, value),
          align: 'center',
        },
      ],
      programs: [],
      modalLoading: false,
      programCreationModal: false,
      newProgram: { name: '' },
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 },
      searchStr: '',
    }
  },
  validations () {
    return {
      newProgram: {
        name: { required },
      },
    }
  },
  computed: {
    filteredPrograms () {
      return this.programs.filter(program => program.name.match(new RegExp(this.searchStr, 'i')));
    },
  },
  async mounted () {
    await this.refreshProgram();
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    goToProgramProfile (row) {
      this.$router.push({ name: 'ni config programs info', params: { programId: row._id } });
    },
    countStepsByType (filterType, value) {
      if (!value) return '';
      const stepsByType = value.filter(s => s.type === filterType);
      return stepsByType.length ? `${stepsByType.length}` : '';
    },
    async refreshProgram () {
      try {
        this.tableLoading = true;
        this.programs = await Programs.list();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des programmes.');
      } finally {
        this.tableLoading = false;
      }
    },
    resetCreationModal () {
      this.$v.newProgram.$reset();
      this.newProgram = { name: '' };
    },
    async createProgram () {
      try {
        this.$v.newProgram.$touch();
        if (this.$v.newProgram.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Programs.create({ ...this.newProgram });

        this.programCreationModal = false;
        NotifyPositive('Programme créé.')
        await this.refreshProgram();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du programme.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
}
</script>
