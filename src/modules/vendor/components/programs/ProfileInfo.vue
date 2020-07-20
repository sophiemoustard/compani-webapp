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
        <ni-file-uploader caption="Image" path="image" :entity="program" alt="image programme" cloudinaryStorage
          :url="programsUploadUrl" @delete="validateProgramImageDeletion" @uploaded="programImageUploaded"
          :additional-value="imageFileName" />
      </div>
    </div>
    <div class="q-mb-xl">
      <p class="text-weight-bold">Étapes ({{ program.steps.length }})</p>
      <q-card v-for="(step, index) of program.steps" :key="index" flat class="step">
        <q-card-section class="step-head cursor-pointer row" @click="showActivities(step._id)">
          <q-item-section side><q-icon :name="getStepTypeIcon(step.type)" size="sm" color="black" /></q-item-section>
          <q-item-section>
            <div class="text-weight-bold">{{step.title}}</div>
            <div class="step-subtitle">
              {{ getStepTypeLabel(step.type) }} -
              {{ step.activities.length }} activité{{ step.activities.length > 1 ? 's' : '' }}
            </div>
          </q-item-section>
          <q-btn flat small color="grey" icon="edit" @click.stop="openStepEditionModal(step)" />
        </q-card-section>
        <div class="beige-background activity-container" v-if="isActivitiesShown[step._id]">
          <q-card v-for="(activity, index) of step.activities" :key="index" flat class="activity">
            <q-card-section class="cursor-pointer" @click="goToActivityProfile(step, activity)">
              <div>{{activity.title}}</div>
              <q-btn flat small color="grey" icon="edit" @click.stop="openActivityEditionModal(activity)" />
            </q-card-section>
          </q-card>
          <q-btn class="q-my-sm" flat no-caps color="primary" icon="add" label="Ajouter une activité"
            @click="openActivityCreationModal(step._id)" />
        </div>
      </q-card>
      <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter une étape"
        @click="stepCreationModal = true" />
    </div>

    <!-- Step creation modal -->
    <ni-modal v-model="stepCreationModal" @hide="resetStepCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">étape</span>
      </template>
      <ni-select in-modal caption="Type" :options="stepTypeOptions" v-model="newStep.type" required-field />
      <ni-input in-modal v-model.trim="newStep.title" :error="$v.newStep.title.$error"
        @blur="$v.newStep.title.$touch" required-field caption="Titre" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer l'étape" color="primary" :loading="modalLoading"
          icon-right="add" @click="createStep" />
      </template>
    </ni-modal>

    <!-- Step edition modal -->
    <ni-modal v-model="stepEditionModal" @hide="resetStepEditionModal">
      <template slot="title">
        Éditer une <span class="text-weight-bold">étape</span>
      </template>
      <ni-select in-modal caption="Type" :options="stepTypeOptions" v-model="editedStep.type" disable />
      <ni-input in-modal v-model.trim="editedStep.title" :error="$v.editedStep.title.$error"
        @blur="$v.editedStep.title.$touch" required-field caption="Titre" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Éditer l'étape" color="primary" :loading="modalLoading"
          icon-right="add" @click="editStep" />
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
import Steps from '@api/Steps';
import Activities from '@api/Activities';
import Cloudinary from '@api/Cloudinary';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import FileUploader from '@components/form/FileUploader.vue';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { E_LEARNING, ON_SITE } from '@data/constants';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-file-uploader': FileUploader,
  },
  data () {
    return {
      tmpInput: '',
      modalLoading: false,
      stepCreationModal: false,
      newStep: { title: '', type: E_LEARNING },
      stepEditionModal: false,
      editedStep: { title: '', type: E_LEARNING },
      activityCreationModal: false,
      newActivity: { title: '' },
      activityEditionModal: false,
      editedActivity: { title: '' },
      isActivitiesShown: {},
      currentStepId: '',
      stepTypeOptions: [
        { label: 'eLearning', value: E_LEARNING },
        { label: 'Présentiel', value: ON_SITE },
      ],
    }
  },
  validations () {
    return {
      program: { name: { required }, learningGoals: { required } },
      newStep: { title: { required }, type: { required } },
      editedStep: { title: { required } },
      newActivity: { title: { required } },
      editedActivity: { title: { required } },
    }
  },
  computed: {
    ...mapState('program', ['program']),
    programsUploadUrl () {
      return `${process.env.API_HOSTNAME}/programs/${this.program._id}/cloudinary/upload`;
    },
    imageFileName () {
      return 'Image-' + this.program.name.replace(/ /g, '_');
    },
  },
  async mounted () {
    if (!this.program) await this.refreshProgram();
    this.$v.program.$touch();
  },
  methods: {
    getStepTypeLabel (value) {
      const type = this.stepTypeOptions.find(type => type.value === value);
      return type ? type.label : '';
    },
    getStepTypeIcon (type) {
      return type === E_LEARNING ? 'stay_current_portrait' : 'mdi-teach';
    },
    showActivities (stepId) {
      this.$set(this.isActivitiesShown, stepId, !this.isActivitiesShown[stepId]);
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
          await Cloudinary.deleteImageById({ id: this.program.image.publicId });
        }
        await Programs.update(this.program._id, { image: { link: null, publicId: null } });

        this.refreshProgram();
        NotifyPositive('Document supprimé');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression du document.');
      }
    },
    async createStep () {
      try {
        this.modalLoading = true;
        this.$v.newStep.$touch();
        if (this.$v.newStep.$error) return NotifyWarning('Champ(s) invalide(s)');
        await Programs.addStep(this.profileId, this.newStep);
        NotifyPositive('Étape créée.');

        await this.refreshProgram();
        this.stepCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de l\'étape.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetStepCreationModal () {
      this.newStep.title = '';
      this.$v.newStep.$reset();
    },
    async openStepEditionModal (step) {
      this.editedStep = pick(step, ['_id', 'title', 'type']);
      this.stepEditionModal = true;
    },
    async editStep () {
      try {
        this.modalLoading = true;
        this.$v.editedStep.$touch();
        if (this.$v.editedStep.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Steps.updateById(this.editedStep._id, pick(this.editedStep, ['title']));
        this.stepEditionModal = false;
        await this.refreshProgram();
        NotifyPositive('Étape modifiée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'étape.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetStepEditionModal () {
      this.editedStep = { title: {} };
      this.$v.editedStep.$reset();
    },
    goToActivityProfile (step, activity) {
      this.$router.push({
        name: 'ni config activity info',
        params: { programId: this.program._id, stepId: step._id, activityId: activity._id },
      });
    },
    openActivityCreationModal (stepId) {
      this.activityCreationModal = true;
      this.currentStepId = stepId;
    },
    async createActivity () {
      try {
        this.modalLoading = true;
        this.$v.newActivity.$touch();
        if (this.$v.newActivity.$error) return NotifyWarning('Champ(s) invalide(s)');
        await Steps.addActivity(this.currentStepId, this.newActivity);
        NotifyPositive('Activitée créée.');

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
.step
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

.q-card
  .q-card__section
    .q-item__section--side
      padding-right: 10px
</style>
