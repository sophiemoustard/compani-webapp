<template>
  <div>
    <p class="text-weight-bold">Règle d'accès</p>
    <q-card>
      <ni-responsive-table :data="accessRules" :columns="columns" :pagination.sync="pagination"
        no-data-label="Pas de règle - la formation est en libre accès" :hide-bottom="!!accessRules.length">
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
  </div>
</template>

<script>
import { mapState } from 'vuex';
import ResponsiveTable from '@components/table/ResponsiveTable';
import Button from '@components/Button';

export default {
  name: 'ProfileAccess',
  components: {
    'ni-responsive-table': ResponsiveTable,
    'ni-button': Button,
  },
  props: {
    profileId: { type: String, required: true },
  },
  computed: {
    ...mapState('course', ['course']),
    accessRules () {
      return this.course.accessRules;
    },
  },
  data () {
    return {
      tableLoading: false,
      columns: [
        { name: 'name', label: 'Structure', align: 'left', field: 'name', style: 'width: 85%' },
        { name: 'actions', label: '', field: '_id' },
      ],
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 50 },
    };
  },
};
</script>
