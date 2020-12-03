<template>
  <div v-if="program">
    <div class="q-mb-xl">
      <p class="text-weight-bold">Identité</p>
      <div class="row gutter-profile">
        <ni-input caption="Nom" v-model.trim="program.name" @focus="saveTmp('name')" @blur="updateProgram('name')"
          :error="$v.program.name.$error" required-field />
        <ni-file-uploader caption="Image" path="image" :entity="program" alt="image programme" cloudinary-storage
          :url="programsUploadUrl" @delete="validateProgramImageDeletion" @uploaded="programImageUploaded"
          :additional-value="imageFileName" label="Pas d'image" :extensions="extensions" :max-file-size="maxFileSize" />
        <ni-input caption="Description" v-model="program.description" type="textarea"
          @focus="saveTmp('description')" @blur="updateProgram('description')" required-field
          :error="$v.program.description.$error" />
        <ni-input caption="Objectifs pédagogiques" v-model="program.learningGoals" type="textarea"
          @focus="saveTmp('learningGoals')" @blur="updateProgram('learningGoals')" required-field
          :error="$v.program.learningGoals.$error" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Catégories</p>
      <q-card class="no-shadow">
        <ni-responsive-table :data="program.categories" :columns="columns">
          <template #body="{ props }">
            <q-tr :props="props">
              <q-td v-for="col in props.cols" :key="col.name" :data-label="col.label" :props="props" :class="col.name"
                :style="col.style">
                <template v-if="col.name === 'actions'">
                  <ni-button class="row no-wrap table-actions" icon="close" :disable="program.categories.length <= 1" />
                </template>
                <template v-else>{{ col.value }}</template>
              </q-td>
            </q-tr>
          </template>
        </ni-responsive-table>
        <q-card-actions align="right">
          <ni-button color="primary" icon="add" label="Ajouter une catégorie" @click="categoryAdditionModal = true" />
        </q-card-actions>
      </q-card>
    </div>

    <category-addition-modal v-model="categoryAdditionModal" :new-category="newCategory" :validations="$v.newCategory"
      @hide="resetModal" @submit="addCategory" :loading="loading" :category-options="categoryOptions" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Programs from '@api/Programs';
import Categories from '@api/Categories';
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import ResponsiveTable from '@components/table/ResponsiveTable';
import CategoryAdditionModal from 'src/modules/vendor/components/programs/CategoryAdditionModal';
import Button from '@components/Button';
import { IMAGE_EXTENSIONS } from '@data/constants';
import { upperCaseFirstLetter } from '@helpers/utils';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
    'ni-button': Button,
    'ni-responsive-table': ResponsiveTable,
    'category-addition-modal': CategoryAdditionModal,
  },
  data () {
    return {
      tmpInput: '',
      extensions: IMAGE_EXTENSIONS,
      maxFileSize: 500 * 1000,
      newCategory: { name: '' },
      categories: [],
      columns: [
        {
          name: 'name',
          label: 'Nom',
          align: 'left',
          field: 'name',
          format: upperCaseFirstLetter,
          style: 'width: 92%',
        },
        { name: 'actions', label: '', field: '_id' },
      ],
      categoryAdditionModal: false,
      loading: false,
    };
  },
  validations () {
    return {
      program: {
        name: { required },
        description: { required },
        learningGoals: { required },
      },
      newCategory: { name: { required } },
    };
  },
  computed: {
    ...mapState('program', ['program']),
    programsUploadUrl () {
      return `${process.env.API_HOSTNAME}/programs/${this.program._id}/upload`;
    },
    imageFileName () {
      return this.program.name.replace(/ /g, '');
    },
    categoryOptions () {
      return this.categories
        .filter(c => !this.program.categories.find(e => e._id === c._id))
        .map(c => ({ label: c.name, value: c._id }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
  },
  async created () {
    this.categories = await Categories.list();
  },
  async mounted () {
    if (!this.program) await this.refreshProgram();
    this.$v.program.$touch();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.program, path);
    },
    async refreshProgram () {
      try {
        await this.$store.dispatch('program/fetchProgram', { programId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    formatCategoryPayload () {
      return { categories: (this.program.categories.map(c => c._id)).push(this.newCategory.name) };
    },
    async updateProgram (path) {
      try {
        const value = get(this.program, path);
        if (this.tmpInput === value) return;

        this.$v.program.$touch();
        if (this.$v.program.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = (path === 'categories') ? this.formatCategoryPayload() : set({}, path, value.trim());

        await Programs.update(this.profileId, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshProgram();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = null;
      }
    },
    programImageUploaded () {
      NotifyPositive('Image envoyée');
      this.refreshProgram();
    },
    validateProgramImageDeletion () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer l\'image ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteProgramImage())
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteProgramImage () {
      try {
        if (get(this.program, 'image')) {
          await Programs.deleteImage(this.program._id);

          this.refreshProgram();
          NotifyPositive('Image supprimée');
        } else NotifyWarning('Il n\'y a pas d\'image a supprimer.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'image.');
      }
    },
    resetModal () {
      this.$v.newCategory.$reset();
      this.newCategory = { name: '' };
    },
    async addCategory () {
      this.$v.newCategory.$touch();
      if (this.$v.newCategory.$error) return NotifyWarning('Champ(s) invalide(s)');
      await this.updateProgram('categories');
    },
  },
};
</script>
