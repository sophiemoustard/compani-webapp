<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Catégories" class="row q-mb-xl" />
    <q-card>
      <ni-responsive-table :data="categories" :columns="columns">
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
        <ni-button color="primary" icon="add" label="Créer une catégorie" :disable="tableLoading"
          @click="categoryCreationModal = true" />
      </q-card-actions>
    </q-card>

    <category-creation-modal v-model="categoryCreationModal" @hide="resetCreationModal" @submit="createCategory"
      :new-category="newCategory" :validations="$v.newCategory" :loading="modalLoading" />
  </q-page>
</template>

<script>
import { required } from 'vuelidate/lib/validators';
import TitleHeader from '@components/TitleHeader';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import ResponsiveTable from '@components/table/ResponsiveTable';
import CategoryCreationModal from 'src/modules/vendor/components/programs/CategoryCreationModal';
import Button from '@components/Button';
import Categories from '@api/Categories';

export default {
  metaInfo: { title: 'Catégories' },
  name: 'CategoriesDirectory',
  components: {
    'ni-title-header': TitleHeader,
    'ni-responsive-table': ResponsiveTable,
    'ni-button': Button,
    'category-creation-modal': CategoryCreationModal,
  },
  data () {
    return {
      tableLoading: false,
      modalLoading: false,
      categories: [],
      newCategory: { name: '' },
      columns: [
        { name: 'name', label: 'Nom', align: 'left', field: 'name', classes: 'text-capitalize', style: 'width: 85%' },
        { name: 'actions', label: '', field: '_id' },
      ],
      categoryCreationModal: false,
    };
  },
  validations () {
    return {
      newCategory: {
        name: { required },
      },
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
        this.categories = [];
        NotifyNegative('Erreur lors de la récupération des catégories.');
      } finally {
        this.tableLoading = false;
      }
    },
    resetCreationModal () {
      this.$v.newCategory.$reset();
      this.newCategory = { name: '' };
    },
    async createCategory () {
      try {
        this.$v.newCategory.$touch();
        if (this.$v.newCategory.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Categories.create({ name: this.newCategory.name.trim() });

        this.categoryCreationModal = false;
        NotifyPositive('Catégorie créée.');
        await this.refreshCategories();
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative('Cette catégorie existe déjà.');
        NotifyNegative('Erreur lors de la création de la catégorie.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
};
</script>
