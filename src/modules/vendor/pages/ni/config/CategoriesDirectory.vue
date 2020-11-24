<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Catégories" class="row q-mb-md" />
    <q-card class="q-mb-md">
      <ni-responsive-table :data="categories" :columns="columns">
        <template v-slot:body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions">
                  <ni-button icon="edit" @click.native="openCategoryEditionModal(props.row)" />
                  <ni-button icon="close" @click.native="validateCategoryDeletion(col.value)" />
                </div>
              </template>
              <template v-else>{{ col.value }}</template>
            </q-td>
          </q-tr>
        </template>
      </ni-responsive-table>
      <q-card-actions align="right">
        <ni-button color="primary" icon="add" label="Créer une catégorie" :disable="!tableLoading"
          @click="traineeCreationModal = true" />
      </q-card-actions>
    </q-card>

    <div>
      test route GET
      {{ categories }}
      <br>
      test route POST
      <q-btn @click="createCategory" label="click" />
    </div>
  </q-page>
</template>

<script>
import get from 'lodash/get';
import TitleHeader from '@components/TitleHeader';
import { NotifyNegative } from '@components/popup/notify';
import ResponsiveTable from '@components/table/ResponsiveTable';
import Button from '@components/Button';
import Categories from '@api/Categories';

export default {
  metaInfo: { title: 'Catégories' },
  name: 'CategoriesDirectory',
  components: {
    'ni-title-header': TitleHeader,
    'ni-responsive-table': ResponsiveTable,
    'ni-button': Button,
  },
  data () {
    return {
      tableLoading: false,
      categories: [],
      newCategory: { name: 'test' },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: row => get(row, 'name') || '',
          classes: 'text-capitalize',
        },
        { name: 'actions', label: '', align: 'right', field: '_id' },
      ],
    };
  },
  async created () {
    await this.refreshCategories();
  },
  methods: {
    async refreshCategories () {
      try {
        this.tableLoading = true;
        this.categories = await Categories.list();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des catégories.');
      } finally {
        this.tableLoading = false;
      }
    },
    async createCategory () {
      await Categories.create({ ...this.newCategory });
      await this.refreshCategories();
    },
  },
};
</script>
