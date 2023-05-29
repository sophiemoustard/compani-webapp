<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Catégories" class="q-mb-xl" />
    <q-card>
      <ni-responsive-table :data="categories" :columns="columns" v-model:pagination="pagination" :hide-bottom="false"
        :loading="tableLoading">
        <template #body="{ props }">
          <q-tr :props="props">
            <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
              :style="col.style">
              <template v-if="col.name === 'actions'">
                <div class="row no-wrap table-actions justify-end">
                  <ni-button icon="edit" @click="openCategoryEditionModal(props.row)" />
                  <ni-button icon="delete" @click="validateCategoryDeletion(props.row)" />
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
      v-model:new-category="newCategory" :validations="v$.newCategory" :loading="modalLoading" />

    <category-edition-modal v-model="categoryEditionModal" @hide="resetEditionModal" @submit="updateCategory"
      v-model:edited-category="editedCategory" :validations="v$.editedCategory" :loading="modalLoading" />
  </q-page>
</template>

<script>
import { useMeta } from 'quasar';
import pick from 'lodash/pick';
import useVuelidate from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import TitleHeader from '@components/TitleHeader';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import ResponsiveTable from '@components/table/ResponsiveTable';
import CategoryCreationModal from 'src/modules/vendor/components/programs/CategoryCreationModal';
import CategoryEditionModal from 'src/modules/vendor/components/programs/CategoryEditionModal';
import Button from '@components/Button';
import Categories from '@api/Categories';
import { upperCaseFirstLetter } from '@helpers/utils';

export default {
  name: 'CategoriesDirectory',
  components: {
    'ni-title-header': TitleHeader,
    'ni-responsive-table': ResponsiveTable,
    'ni-button': Button,
    'category-creation-modal': CategoryCreationModal,
    'category-edition-modal': CategoryEditionModal,
  },
  setup () {
    const metaInfo = { title: 'Catégories' };
    useMeta(metaInfo);

    return { v$: useVuelidate() };
  },
  data () {
    return {
      tableLoading: false,
      modalLoading: false,
      categories: [],
      newCategory: { name: '' },
      editedCategory: { name: '' },
      columns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
          format: upperCaseFirstLetter,
        },
        { name: 'actions', label: '', field: '_id' },
      ],
      categoryCreationModal: false,
      categoryEditionModal: false,
      pagination: { sortBy: 'name', ascending: true, page: 1, rowsPerPage: 15 },
    };
  },
  validations () {
    return {
      newCategory: { name: { required } },
      editedCategory: { name: { required } },
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
      this.v$.newCategory.$reset();
      this.newCategory = { name: '' };
    },
    resetEditionModal () {
      this.v$.editedCategory.$reset();
      this.editedCategory = { name: '' };
    },
    async createCategory () {
      try {
        this.v$.newCategory.$touch();
        if (this.v$.newCategory.$error) return NotifyWarning('Champ(s) invalide(s)');

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
    async updateCategory () {
      try {
        this.v$.editedCategory.$touch();
        if (this.v$.editedCategory.$error) return NotifyWarning('Champ(s) invalide(s)');

        this.modalLoading = true;
        await Categories.update(this.editedCategory._id, { name: this.editedCategory.name.trim() });

        this.categoryEditionModal = false;
        NotifyPositive('Catégorie modifiée.');
        await this.refreshCategories();
      } catch (e) {
        console.error(e);
        if (e.data.statusCode === 409) return NotifyNegative('Le nouveau nom de catégorie existe déjà.');
        NotifyNegative('Erreur lors de la modification de la catégorie.');
      } finally {
        this.modalLoading = false;
      }
    },
    async openCategoryEditionModal (category) {
      this.editedCategory = pick(category, ['_id', 'name']);
      this.categoryEditionModal = true;
    },
    validateCategoryDeletion (category) {
      if (category.programsCount) {
        return NotifyWarning('Certains programmes sont encore rattachés à cette catégorie.');
      }
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer cette catégorie&nbsp;?',
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteCategory(category._id))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteCategory (categoryId) {
      try {
        this.modalLoading = true;
        await Categories.delete(categoryId);

        NotifyPositive('Catégorie supprimée.');
        await this.refreshCategories();
      } catch (e) {
        console.error(e);
        if (e.status === 403) return NotifyNegative('Certains programmes sont encore rattachés à cette catégorie.');
        NotifyNegative('Erreur lors de la suppresion de la catégorie.');
      } finally {
        this.modalLoading = false;
      }
    },
  },
};
</script>
