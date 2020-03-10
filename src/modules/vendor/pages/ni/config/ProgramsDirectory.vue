<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Catalogue" search-placeholder="Rechercher un programme"
      @updateSearch="updateSearch" :search="searchStr" />
    <ni-table-list :data="filteredProgram" :columns="columns" :loading="tableLoading" :pagination.sync="pagination"
      @goTo="goToProgramProfile" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une formation"
      @click="programCreationModal = true" />

    <!-- Program creation modal -->
    <ni-modal v-model="programCreationModal" @hide="resetCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">formation</span>
      </template>
      <ni-input in-modal v-model.trim="newProgram.name" :error="$v.newProgram.name.$error"
        @blur="$v.newProgram.name.$touch" required-field caption="Nom" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la formation" color="primary" :loading="modalLoading"
          icon-right="add" @click="createProgram" :disable="!this.newProgram.name" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import Program from '@api/Programs';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyPositive } from '@components/popup/notify';

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
      columns: [{ name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true }],
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
    filteredProgram () {
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
      this.$router.push({ name: 'profile program info', params: { programId: row._id } });
    },
    async refreshProgram () {
      try {
        this.tableLoading = true;
        this.programs = await Program.list();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des formations');
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
        this.modalLoading = true;
        await Program.create({ ...this.newProgram });

        this.programCreationModal = false;
        NotifyPositive('Formation créée.')
        await this.refreshProgram();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la formation.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
}
</script>
