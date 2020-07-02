<template>
  <div v-if="program">
    <div class="q-mb-xl">
      <p class="text-weight-bold">Informations générales</p>
      <div class="row gutter-profile">
        <ni-input caption="Nom" v-model.trim="program.name" @focus="saveTmp('name')" @blur="updateProgram('name')"
          :error="$v.program.name.$error" required-field />
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Objectifs pédagogiques" v-model.trim="program.learningGoals" type="textarea"
          @focus="saveTmp('learningGoals')" @blur="updateProgram('learningGoals')" required-field
          :error="$v.program.learningGoals.$error" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Modules</p>
      <div v-for="(module, index) of program.modules" :key="index">
        <q-card flat class="module-card">
          <q-card-section>{{module.title}}</q-card-section>
        </q-card>
      </div>
      <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un module"
        @click="moduleCreationModal = true" />
    </div>

    <!-- Module creation modal -->
    <ni-modal v-model="moduleCreationModal" @hide="resetModuleCreationModal">
      <template slot="title">
        Créer un nouveau <span class="text-weight-bold">module</span>
      </template>
      <ni-input in-modal v-model.trim="newModule.title" :error="$v.newModule.title.$error"
        @blur="$v.newModule.title.$touch" required-field caption="Titre" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer le module" color="primary" :loading="modalLoading"
          icon-right="add" @click="createModule" />
      </template>
    </ni-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Programs from '@api/Programs';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  data () {
    return {
      tmpInput: '',
      moduleCreationModal: false,
      modalLoading: false,
      newModule: { title: '' },
    }
  },
  validations () {
    return {
      program: { name: { required }, learningGoals: { required } },
      newModule: { title: { required } },
    }
  },
  computed: {
    ...mapState('program', ['program']),
  },
  async mounted () {
    if (!this.program) await this.refreshProgram();
    this.$v.program.$touch();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.program, path)
    },
    async refreshProgram () {
      try {
        await this.$store.dispatch('program/fetchProgram', { programId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    async updateProgram (path) {
      try {
        const value = get(this.program, path);
        if (this.tmpInput === value) return;
        this.$v.program.$touch();
        if (this.$v.program.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = set({}, path, value);
        await Programs.update(this.profileId, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshProgram();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = null;
      }
    },
    async createModule () {
      try {
        this.modalLoading = true;
        this.$v.newModule.$touch();
        if (this.$v.newModule.$error) return NotifyWarning('Champ(s) invalide(s)');
        await Programs.addModule(this.profileId, this.newModule);
        NotifyPositive('Module créé.');

        await this.refreshProgram();
        this.resetModuleCreationModal();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création du module.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetModuleCreationModal () {
      this.newModule.title = '';
      this.$v.newModule.$reset();
      this.moduleCreationModal = false;
    },
  },
}
</script>

<style lang="stylus" scoped>
.module-card
  margin-bottom: 10px;
</style>
