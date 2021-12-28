<template>
  <q-page class="vendor-background" padding>
    <ni-directory-header title="Catalogue" search-placeholder="Rechercher un programme" @update-search="updateSearch"
      :search="searchStr" />
    <ni-table-list :data="filteredPrograms" :columns="columns" :loading="tableLoading" v-model:pagination="pagination"
      @go-to="goToProgramProfile" />
    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un programme"
      @click="programCreationModal = true" :disable="tableLoading" />

    <program-creation-modal v-model="programCreationModal" @hide="resetCreationModal" @submit="createProgram"
      :validations="v$.newProgram" :loading="modalLoading" v-model:new-program="newProgram" />
  </q-page>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import escapeRegExp from 'lodash/escapeRegExp';
import Programs from '@api/Programs';
import DirectoryHeader from '@components/DirectoryHeader';
import TableList from '@components/table/TableList';
import ProgramCreationModal from 'src/modules/vendor/components/programs/ProgramCreationModal';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { removeDiacritics } from '@helpers/utils';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'ProgramDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
    'ni-table-list': TableList,
    'program-creation-modal': ProgramCreationModal,
  },
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    return {
      tableLoading: false,
      columns: [
        { name: 'name', label: 'Nom', field: 'name', align: 'left', sortable: true },
        {
          name: 'subPrograms',
          label: 'Sous-programmes',
          field: 'subPrograms',
          format: value => value.length,
          sortable: true,
          sort: (a, b) => b.length - a.length,
          align: 'center',
        },
      ],
      programs: [],
      modalLoading: false,
      programCreationModal: false,
      newProgram: { name: '', category: '' },
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 },
      searchStr: '',
    };
  },
  validations () {
    return {
      newProgram: {
        name: { required },
        category: { required },
      },
    };
  },
  computed: {
    filteredPrograms () {
      const formattedString = escapeRegExp(removeDiacritics(this.searchStr));
      return this.programs.filter(program => program.noDiacriticsName.match(new RegExp(formattedString, 'i')));
    },
  },
  async created () {
    await this.refreshProgram();
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
    goToProgramProfile (row) {
      this.$router.push({ name: 'ni pedagogy programs info', params: { programId: row._id } });
    },
    async refreshProgram () {
      try {
        this.tableLoading = true;
        const programList = await Programs.list();

        this.programs = programList.map(p => ({ ...p, noDiacriticsName: removeDiacritics(p.name) }));
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des programmes.');
      } finally {
        this.tableLoading = false;
      }
    },
    resetCreationModal () {
      this.v$.newProgram.$reset();
      this.newProgram = { name: '' };
    },
    async createProgram () {
      try {
        this.v$.newProgram.$touch();
        if (this.v$.newProgram.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Programs.create({ name: this.newProgram.name, categories: [this.newProgram.category] });

        this.programCreationModal = false;
        NotifyPositive('Programme créé.');
        await this.refreshProgram();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du programme.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
};
</script>
