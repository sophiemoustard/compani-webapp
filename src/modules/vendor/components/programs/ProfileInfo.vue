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
          :additional-value="imageFileName" label="Pas d'image" :extensions="extensions" :maxFileSize="500000" />
      </div>
    </div>
<<<<<<< HEAD
=======
    <div class="q-mb-xl">
      <p class="text-weight-bold">Étapes ({{ program.steps.length }})</p>
      <q-card v-for="(step, index) of program.steps" :key="index" flat class="step">
        <q-card-section class="step-head cursor-pointer row" @click="showActivities(step._id)">
          <q-item-section side><q-icon :name="getStepTypeIcon(step.type)" size="sm" color="black" /></q-item-section>
          <q-item-section>
            <div class="text-weight-bold">{{step.name}}</div>
            <div class="step-subtitle">
              {{ getStepTypeLabel(step.type) }} -
              {{ printAmountOf('activité', step.activities.length) }}
            </div>
          </q-item-section>
          <q-btn flat small color="grey" icon="edit" @click.stop="openStepEditionModal(step)" />
        </q-card-section>
        <div class="beige-background activity-container" v-if="isActivitiesShown[step._id]">
          <q-card v-for="(activity, index) of step.activities" :key="index" flat class="activity">
            <q-card-section class="cursor-pointer row" @click="goToActivityProfile(step, activity)">
              <div class="col-xs-9 col-sm-6">{{ activity.name }}</div>
              <div class="gt-xs col-sm-2">{{ getActivityTypeLabel(activity.type) }}</div>
              <div class="gt-xs col-sm-2"> {{ printAmountOf('carte', activity.cards.length) }}</div>
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
      <ni-option-group inline caption="Type" v-model="newStep.type" type="radio" :options="stepTypeOptions"
        required-field />
      <ni-input in-modal v-model.trim="newStep.name" :error="$v.newStep.name.$error"
        @blur="$v.newStep.name.$touch" required-field caption="Nom" />
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
      <ni-input in-modal v-model.trim="editedStep.name" :error="$v.editedStep.name.$error"
        @blur="$v.editedStep.name.$touch" required-field caption="Nom" />
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
      <ni-input in-modal v-model.trim="newActivity.name" :error="$v.newActivity.name.$error"
        @blur="$v.newActivity.name.$touch" required-field caption="Nom" />
      <ni-select in-modal caption="Type" :options="activityTypeOptions" v-model="newActivity.type" required />
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
      <ni-input in-modal v-model.trim="editedActivity.name" :error="$v.editedActivity.name.$error"
        @blur="$v.editedActivity.name.$touch" required-field caption="Nom" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Éditer l'activité" color="primary" :loading="modalLoading"
          icon-right="add" @click="editActivity" />
      </template>
    </ni-modal>
>>>>>>> 6db4f8fa... COM-1413 add util fct 'printAmountOf'
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
<<<<<<< HEAD
=======
import pick from 'lodash/pick';
import { printAmountOf } from '@helpers/utils';
>>>>>>> 6db4f8fa... COM-1413 add util fct 'printAmountOf'
import Programs from '@api/Programs';
import Cloudinary from '@api/Cloudinary';
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader.vue';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
  },
  data () {
    return {
      tmpInput: '',
      extensions: 'image/jpg, image/jpeg',
      printAmountOf,
    }
  },
  validations () {
    return {
      program: { name: { required }, learningGoals: { required } },
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
          await Programs.update(this.program._id, { image: { link: null, publicId: null } });

          this.refreshProgram();
          NotifyPositive('Image supprimée');
        } else NotifyNegative('Erreur lors de la suppression de l\'image.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'image.');
      }
    },
  },
}
</script>
