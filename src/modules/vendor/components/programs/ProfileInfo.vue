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
      <q-card v-for="(module, index) of program.modules" :key="index" flat class="module">
        <q-card-section class="module-head cursor-pointer row" @click="showActivities(module._id)">
          <div>
            <div class="text-weight-bold">{{module.title}}</div>
            <div class="module-subtitle">{{module.activities.length}} activité(s)</div>
          </div>
          <q-btn flat small color="grey" icon="edit" @click.stop="openModuleEditionModal(module)" />
        </q-card-section>
        <div class="beige-background activity-container" v-if="isActivitiesShown[module._id]">
          <q-card v-for="(activity, index) of module.activities" :key="index" flat class="activity">
            <q-card-section>
              <div>{{activity.title}}</div>
              <q-btn flat small color="grey" icon="edit" @click="openActivityEditionModal(activity)" />
            </q-card-section>
          </q-card>
          <q-btn class="q-my-sm" flat no-caps color="primary" icon="add" label="Ajouter une activité"
            @click="openActivityCreationModal(module._id)" />
        </div>
      </q-card>
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

    <!-- Module edition modal -->
    <ni-modal v-model="moduleEditionModal" @hide="resetModuleEditionModal">
      <template slot="title">
        Éditer un <span class="text-weight-bold">module</span>
      </template>
      <ni-input in-modal v-model.trim="editedModule.title" :error="$v.editedModule.title.$error"
        @blur="$v.editedModule.title.$touch" required-field caption="Titre" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Éditer le module" color="primary" :loading="modalLoading"
          icon-right="add" @click="editModule" />
      </template>
    </ni-modal>

    <!-- Activity creation modal -->
    <ni-modal v-model="activityCreationModal" @hide="resetActivityCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">activité</span>
      </template>
      <ni-input in-modal v-model.trim="newActivity.title" :error="$v.newActivity.title.$error"
        @blur="$v.newActivity.title.$touch" required-field caption="Titre" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer l'activité" color="primary" :loading="modalLoading"
          icon-right="add" @click="createActivity" />
      </template>
    </ni-modal>

    <!-- Activity edition modal -->
    <ni-modal v-model="activityEditionModal" @hide="resetActivityEditionModal">
      <template slot="title">
        Éditer une <span class="text-weight-bold">activité</span>
      </template>
      <ni-input in-modal v-model.trim="editedActivity.title" :error="$v.editedActivity.title.$error"
        @blur="$v.editedActivity.title.$touch" required-field caption="Titre" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Éditer l'activité" color="primary" :loading="modalLoading"
          icon-right="add" @click="editActivity" />
      </template>
    </ni-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import pick from 'lodash/pick';
import Programs from '@api/Programs';
import Modules from '@api/Modules';
import Activities from '@api/Activities';
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
      modalLoading: false,
      moduleCreationModal: false,
      newModule: { title: '' },
      moduleEditionModal: false,
      editedModule: { title: '' },
      activityCreationModal: false,
      newActivity: { title: '' },
      activityEditionModal: false,
      editedActivity: { title: '' },
      isActivitiesShown: {},
      currentModuleId: '',
    }
  },
  validations () {
    return {
      program: { name: { required }, learningGoals: { required } },
      newModule: { title: { required } },
      editedModule: { title: { required } },
      newActivity: { title: { required } },
      editedActivity: { title: { required } },
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
    showActivities (moduleId) {
      this.$set(this.isActivitiesShown, moduleId, !this.isActivitiesShown[moduleId]);
    },
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
        this.moduleCreationModal = false;
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
    },
    async openModuleEditionModal (module) {
      this.editedModule = pick(module, ['_id', 'title']);
      this.moduleEditionModal = true;
    },
    async editModule () {
      try {
        this.modalLoading = true;
        this.$v.editedModule.$touch();
        if (this.$v.editedModule.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Modules.updateById(this.editedModule._id, pick(this.editedModule, ['title']));
        this.moduleEditionModal = false;
        await this.refreshProgram();
        NotifyPositive('Module modifié.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification du module.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetModuleEditionModal () {
      this.editedModule = { title: {} };
      this.$v.editedModule.$reset();
    },
    openActivityCreationModal (moduleId) {
      this.activityCreationModal = true;
      this.currentModuleId = moduleId;
    },
    async createActivity () {
      try {
        this.modalLoading = true;
        this.$v.newActivity.$touch();
        if (this.$v.newActivity.$error) return NotifyWarning('Champ(s) invalide(s)');
        await Modules.addActivity(this.currentModuleId, this.newActivity);
        NotifyPositive('Activitée créé.');

        await this.refreshProgram();
        this.activityCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'activité.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetActivityCreationModal () {
      this.newActivity.title = '';
      this.$v.newActivity.$reset();
    },
    async openActivityEditionModal (activity) {
      this.editedActivity = pick(activity, ['_id', 'title']);
      this.activityEditionModal = true;
    },
    async editActivity () {
      try {
        this.modalLoading = true;
        this.$v.editedActivity.$touch();
        if (this.$v.editedActivity.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Activities.updateById(this.editedActivity._id, pick(this.editedActivity, ['title']));
        this.activityEditionModal = false;
        await this.refreshProgram();
        NotifyPositive('Activité modifiée.');
      } catch (e) {
        console.error(e);
        NotifyNegative("Erreur lors de la modification de l'activité.");
      } finally {
        this.modalLoading = false;
      }
    },
    resetActivityEditionModal () {
      this.editedActivity = { title: {} };
      this.$v.editedActivity.$reset();
    },
  },
}
</script>

<style lang="stylus" scoped>
.module
  margin-bottom: 10px
  &-head
    justify-content: space-between
  &-subtitle
    font-size: 13px

.activity-container
  display: flex
  flex-direction: column
  align-items: flex-end
.activity
  width: -moz-available
  width: -webkit-fill-available
  margin: 10px 10px 0px 50px
  .q-card__section
    display: flex
    justify-content: space-between
    align-items: center
  .q-card__section--vert
    padding: 3px 3px 3px 10px
.q-btn
    width: fit-content
</style>
