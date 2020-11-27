<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Règle d'accès" class="row q-mb-xl" />
    <q-card>
      <ni-responsive-table :data="accessRules" :columns="columns" :pagination.sync="pagination">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <ni-button icon="edit" disabled="true" />
                  <ni-button icon="delete" disabled="true" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-responsive-table>
      <q-card-actions align="right">
        <ni-button color="primary" icon="add" label="Ajouter une règle" :disable="tableLoading" />
      </q-card-actions>
    </q-card>
  </q-page>
</template>

<script>
import TitleHeader from '@components/TitleHeader';
import { NotifyNegative } from '@components/popup/notify';
import ResponsiveTable from '@components/table/ResponsiveTable';
import Button from '@components/Button';
import Courses from '@api/Courses';

export default {
  name: 'ELearningCourseAccess',
  components: {
    'ni-title-header': TitleHeader,
    'ni-responsive-table': ResponsiveTable,
    'ni-button': Button,
  },
  props: {
    profileId: { type: String, required: true },
  },
  data () {
    return {
      tableLoading: false,
      accessRules: [],
      columns: [
        { name: 'name', label: 'Structure', align: 'left', field: 'name', style: 'width: 85%' },
        { name: 'actions', label: '', field: '_id' },
      ],
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 50 },
    };
  },
  async created () {
    await this.refreshAccessRules();
  },
  methods: {
    async refreshAccessRules () {
      try {
        this.tableLoading = true;
        const course = await Courses.getById(this.profileId);
        this.accessRules = course.accessRules;
      } catch (e) {
        console.error(e);
        this.accessRules = [];
        NotifyNegative('Erreur lors de la récupération des catégories.');
      } finally {
        this.tableLoading = false;
      }
    },
  },
};
</script>
