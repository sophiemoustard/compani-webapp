<template>
  <div v-if="program">
    <div v-for="(subProgram, index) of program.subPrograms" class="q-mb-xl sub-program-container" :key="index">
      <div>
        <span class="text-weight-bold">Sous-programme {{ index + 1 }}</span>
        <span class="published-sub-program bg-green-600" v-if="isPublished(subProgram)">Publié</span>
      </div>
      <ni-input v-model.trim="program.subPrograms[index].name" required-field caption="Nom" @focus="saveTmpName(index)"
        @blur="updateSubProgramName(index)" :error="getSubProgramError(index)"
        :disable="isPublished(subProgram)" />
      <draggable v-model="subProgram.steps" @change="dropStep(subProgram._id)" ghost-class="ghost"
        :disabled="$q.platform.is.mobile || isPublished(subProgram)" item-key="_id">
        <template #item="{element: step, index: stepIndex}">
          <q-card flat class="step q-mb-sm">
            <q-card-section class="step-head cursor-pointer row" :id="step._id"
              :class="{ 'step-lock': isLocked(step) }">
              <div class="step-info" @click="showActivities(step._id)">
                <q-item-section side>
                  <q-icon :name="getStepTypeIcon(step.type)" size="sm" color="copper-grey-500" />
                </q-item-section>
                <q-item-section>
                  <div class="flex-direction row step-title">
                    <div class="text-weight-bold">
                      <span>{{ stepIndex + 1 }} - {{ step.name }}</span>
                      <ni-button v-if="isLocked(step)" icon="lock" class="q-ml-sm q-px-xs" size="sm"
                        @click="openValidateUnlockingEditionModal(step)" />
                    </div>
                    <published-dot :is-published="isPublished(step)" :status="isStepValid(step)" />
                  </div>
                  <div class="step-subtitle">
                    {{ getStepTypeLabel(step.type) }} - {{ formatQuantity('activité', step.activities.length) }}
                     - {{ formatDurationFromFloat(step.theoreticalHours) }}
                  </div>
                </q-item-section>
              </div>
              <div class="flex align-center">
                <ni-button icon="edit" @click="openStepEditionModal(step)" />
                <ni-button icon="close" @click="validateStepDetachment(subProgram._id, step._id)"
                  :disable="isPublished(subProgram)" />
              </div>
            </q-card-section>
            <div class="bg-peach-200 activity-container" v-if="areActivitiesVisible[step._id]">
              <draggable v-model="step.activities" :disabled="$q.platform.is.mobile || isPublishedOrLocked(step)"
                class="activity-draggable" ghost-class="ghost" @change="dropActivity(subProgram._id, step._id)"
                item-key="_id">
                <template #item="{element: activity }">
                  <q-card flat class="activity">
                    <q-card-section :class="{ 'step-lock': isLocked(step) }">
                      <div class="cursor-pointer row activity-info"
                        @click="goToActivityProfile(subProgram, step, activity)">
                        <div class="col-xs-8 col-sm-5">{{ activity.name }}</div>
                        <div class="gt-xs col-sm-2 activity-content">{{ getActivityTypeLabel(activity.type) }}</div>
                        <div class="gt-xs col-sm-2 activity-content">
                          {{ formatQuantity('carte', activity.cards.length) }}
                        </div>
                        <published-dot :is-published="isPublished(activity)"
                          :status="activity.areCardsValid ? PUBLISHED_DOT_ACTIVE : PUBLISHED_DOT_WARNING" />
                      </div>
                      <div class="row no-wrap">
                        <ni-button class="q-px-sm" icon="close" :disable="isPublished(step)"
                          @click="validateActivityDeletion(step, activity._id)" />
                      </div>
                    </q-card-section>
                  </q-card>
                </template>
              </draggable>
              <div v-if="!isPublished(step)" class="q-mt-md" align="right">
                <ni-button color="primary" icon="add" label="Réutiliser une activité" :disable="isLocked(step)"
                  @click="openActivityReuseModal(step)" />
                <ni-button color="primary" icon="add" label="Créer une activité" :disable="isLocked(step)"
                  @click="openActivityCreationModal(step._id)" />
              </div>
              <div class="no-activity" v-if="isPublished(step) && !step.activities.length">
                Il n'y a pas d'activité
              </div>
            </div>
          </q-card>
        </template>
      </draggable>
      <div class="q-my-md sub-program-footer">
        <ni-button v-if="!isPublished(subProgram)" color="primary" label="Publier" icon="vertical_align_top"
          @click="checkPublicationAndOpenModal(subProgram)" :flat="false" />
        <ni-button v-if="!isPublished(subProgram)" class="add-step-button" color="primary" icon="add"
          @click="openStepAdditionModal(subProgram._id)" label="Ajouter une étape" />
      </div>
      <q-separator v-if="index !== program.subPrograms.length-1" class="q-mt-lg" />
    </div>

    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un sous programme"
      @click="subProgramCreationModal = true" />

    <sub-program-creation-modal v-model="subProgramCreationModal" :loading="modalLoading" @submit="createSubProgram"
      :validations="v$.newSubProgram" @hide="resetSubProgramCreationModal" v-model:new-sub-program="newSubProgram" />

    <step-addition-modal v-model="stepAdditionModal" v-model:new-step="newStep" v-model:reused-step="reusedStep"
      @hide="resetStepAdditionModal" @submit="addStep" :loading="modalLoading" v-model:addition-type="additionType"
      :program="program" :validations="v$" :sub-program-id="currentSubProgramId" />

    <step-edition-modal v-model="stepEditionModal" v-model:edited-step="editedStep" :validations="v$.editedStep"
      :theoretical-hours-error-msg="theoreticalHoursErrorMsg" @hide="resetStepEditionModal" @submit="editStep"
      :loading="modalLoading" />

    <activity-creation-modal v-model="activityCreationModal" v-model:new-activity="newActivity" :loading="modalLoading"
      @hide="resetActivityCreationModal" @submit="createActivity" :validations="v$.newActivity" />

    <activity-reuse-modal v-model="activityReuseModal" @submit-reuse="reuseActivity" :program-options="programOptions"
      :loading="modalLoading" :validations="v$.reusedActivity" :same-step-activities="sameStepActivities"
      v-model:reused-activity="reusedActivity" @hide="resetActivityReuseModal"
      @submit-duplication="duplicateActivity" />

    <sub-program-publication-modal v-model="subProgramPublicationModal" @submit="validateSubProgramPublication"
      :company-options="companyOptions" @hide="resetPublication" />

    <validate-unlocking-step-modal :model-value="validateUnlockingEditionModal" @cancel="cancelUnlocking"
      :sub-programs-grouped-by-program="subProgramsReusingStepToBeUnlocked" @hide="resetValidateUnlockingEditionModal"
      @confirm="confirmUnlocking" :is-step-published="stepToBeUnlocked.status === PUBLISHED" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import draggable from 'vuedraggable';
import useVuelidate from '@vuelidate/core';
import { required, helpers } from '@vuelidate/validators';
import pick from 'lodash/pick';
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import Programs from '@api/Programs';
import SubPrograms from '@api/SubPrograms';
import Steps from '@api/Steps';
import Companies from '@api/Companies';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import {
  E_LEARNING,
  ACTIVITY_TYPES,
  PUBLISHED,
  PUBLISHED_DOT_ACTIVE,
  PUBLISHED_DOT_WARNING,
  CREATE_STEP,
  REQUIRED_LABEL,
} from '@data/constants';
import { formatQuantity, formatAndSortOptions, sortStrings } from '@helpers/utils';
import { formatDurationFromFloat } from '@helpers/date';
import { strictPositiveNumber } from '@helpers/vuelidateCustomVal';
import Button from '@components/Button';
import SubProgramCreationModal from 'src/modules/vendor/components/programs/SubProgramCreationModal';
import StepAdditionModal from 'src/modules/vendor/components/programs/StepAdditionModal';
import StepEditionModal from 'src/modules/vendor/components/programs/StepEditionModal';
import ActivityCreationModal from 'src/modules/vendor/components/programs/ActivityCreationModal';
import ActivityReuseModal from 'src/modules/vendor/components/programs/ActivityReuseModal';
import SubProgramPublicationModal from 'src/modules/vendor/components/programs/SubProgramPublicationModal';
import ValidateUnlockingStepModal from 'src/modules/vendor/components/programs/ValidateUnlockingStepModal';
import PublishedDot from 'src/modules/vendor/components/programs/PublishedDot';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'ProfileContent',
  mixins: [courseMixin],
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-input': Input,
    'ni-button': Button,
    'sub-program-creation-modal': SubProgramCreationModal,
    'step-addition-modal': StepAdditionModal,
    'step-edition-modal': StepEditionModal,
    'activity-creation-modal': ActivityCreationModal,
    'activity-reuse-modal': ActivityReuseModal,
    'sub-program-publication-modal': SubProgramPublicationModal,
    'validate-unlocking-step-modal': ValidateUnlockingStepModal,
    draggable,
    'published-dot': PublishedDot,
  },
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    return {
      tmpInput: '',
      modalLoading: false,
      subProgramCreationModal: false,
      newSubProgram: { name: '' },
      additionType: CREATE_STEP,
      stepAdditionModal: false,
      newStep: { name: '', type: E_LEARNING },
      reusedStep: { _id: '', program: '' },
      stepEditionModal: false,
      editedStep: { name: '', type: E_LEARNING, theoreticalHours: 0 },
      activityCreationModal: false,
      newActivity: { name: '' },
      activityReuseModal: false,
      sameStepActivities: [],
      reusedActivity: '',
      programOptions: [],
      areActivitiesVisible: {},
      currentSubProgramId: '',
      currentStepId: '',
      PUBLISHED,
      PUBLISHED_DOT_ACTIVE,
      PUBLISHED_DOT_WARNING,
      subProgramPublicationModal: false,
      companyOptions: [],
      subProgramToPublish: null,
      areStepsLocked: {},
      validateUnlockingEditionModal: false,
      subProgramsReusingStepToBeUnlocked: [],
      stepToBeUnlocked: { _id: '', status: '' },
      openNextModalAfterUnlocking: () => null,
    };
  },
  validations () {
    return {
      program: { subPrograms: { $each: helpers.forEach({ name: { required } }) } },
      newSubProgram: { name: { required } },
      newStep: { name: { required }, type: { required } },
      reusedStep: { _id: { required }, program: { required } },
      editedStep: { name: { required }, theoreticalHours: { required, strictPositiveNumber } },
      newActivity: { name: { required }, type: { required } },
      reusedActivity: { required },
    };
  },
  computed: {
    ...mapState('program', ['program', 'openedStep']),
    theoreticalHoursErrorMsg () {
      const validation = this.v$.editedStep;
      if (validation.theoreticalHours.required.$response === false) return REQUIRED_LABEL;
      if (validation.theoreticalHours.strictPositiveNumber.$response === false) return 'Durée non valide';

      return '';
    },
  },
  async created () {
    if (!this.program) await this.refreshProgram();
    await this.refreshProgramList();
    await this.initAreStepsLocked();

    if (this.openedStep) {
      this.showActivities(this.openedStep);
      this.scrollToOpenedStep(this.openedStep);
      this.$store.dispatch('program/resetOpenedStep');
    }
  },
  methods: {
    getSubProgramError (index) {
      const validation = this.v$.program.subPrograms.$each.$response.$errors[index];

      return get(validation, 'name.0.$response') === false;
    },
    async dropStep (subProgramId) {
      try {
        const subProgram = this.program.subPrograms.find(sp => sp._id === subProgramId);
        const steps = subProgram.steps.map(s => s._id);
        await SubPrograms.update(subProgramId, { steps });

        NotifyPositive('Modification enregistrée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification des étapes.');
      } finally {
        await this.refreshProgram();
      }
    },
    async dropActivity (subProgramId, stepId) {
      try {
        const subProgram = this.program.subPrograms.find(sp => sp._id === subProgramId);
        const step = subProgram.steps.find(s => s._id === stepId);
        const activities = step.activities.map(a => a._id);
        await Steps.updateById(stepId, { activities });

        NotifyPositive('Modification enregistrée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification des activités.');
      } finally {
        await this.refreshProgram();
      }
    },
    formatQuantity,
    saveTmpName (index) {
      this.tmpInput = this.program.subPrograms[index] ? this.program.subPrograms[index].name : '';
    },
    getActivityTypeLabel (value) {
      const type = ACTIVITY_TYPES.find(t => t.value === value);
      return type ? type.label : '';
    },
    showActivities (stepId) {
      this.areActivitiesVisible[stepId] = !this.areActivitiesVisible[stepId];
    },
    async refreshProgram () {
      try {
        await this.$store.dispatch('program/fetchProgram', { programId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    // SUB-PROGRAM
    async updateSubProgramName (index) {
      try {
        const subProgramName = get(this.program.subPrograms[index], 'name');
        const subProgramId = get(this.program.subPrograms[index], '_id');

        if (this.tmpInput === subProgramName) return;
        this.v$.program.$touch();
        if (this.v$.program.$error) return NotifyWarning('Champ(s) invalide(s)');

        await SubPrograms.update(subProgramId, { name: subProgramName });
        NotifyPositive('Modification enregistrée.');

        await this.refreshProgram();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message);
        NotifyNegative('Erreur lors de la modification du sous-programme.');
      } finally {
        this.tmpInput = null;
      }
    },
    async createSubProgram () {
      try {
        this.modalLoading = true;
        this.v$.newSubProgram.$touch();
        if (this.v$.newSubProgram.$error) return NotifyWarning('Champ(s) invalide(s)');
        await Programs.addSubProgram(this.profileId, this.newSubProgram);
        NotifyPositive('Sous-programme créé.');

        await this.refreshProgram();
        this.subProgramCreationModal = false;
      } catch (e) {
        console.error(e);

        NotifyNegative('Erreur lors de la création du sous-programme.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetSubProgramCreationModal () {
      this.subProgramCreationModal = false;
      this.newSubProgram.name = '';
      this.v$.newSubProgram.$reset();
    },
    // STEP
    async openStepAdditionModal (subProgramId) {
      this.stepAdditionModal = true;
      this.currentSubProgramId = subProgramId;
    },
    setStepLocking (step, value) {
      Object.assign(this.areStepsLocked, { [step._id]: value });
    },
    async addStep () {
      try {
        this.modalLoading = true;

        if (this.additionType === CREATE_STEP) {
          this.v$.newStep.$touch();
          if (this.v$.newStep.$error) return NotifyWarning('Champ(s) invalide(s)');

          await SubPrograms.addStep(this.currentSubProgramId, this.newStep);
          NotifyPositive('Étape créée.');
        } else {
          this.v$.reusedStep.$touch();
          if (this.v$.reusedStep.$error) return NotifyWarning('Champ(s) invalide(s)');

          await SubPrograms.reuseStep(this.currentSubProgramId, { steps: this.reusedStep._id });
          this.setStepLocking(this.reusedStep, true);
          NotifyPositive('Étape réutilisée.');
        }

        await this.refreshProgram();
        this.stepAdditionModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de l\'ajout de l\'étape.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetStepAdditionModal () {
      this.newStep.name = '';
      this.additionType = CREATE_STEP;
      this.reusedStep = { _id: '', program: '' };
      this.v$.newStep.$reset();
      this.v$.reusedStep.$reset();
    },
    // step edition
    async openStepEditionModal (step) {
      if (this.isLocked(step)) {
        this.openNextModalAfterUnlocking = () => this.openStepEditionModal(step);
        this.openValidateUnlockingEditionModal(step);
      } else {
        this.editedStep = pick(step, ['_id', 'name', 'type', 'theoreticalHours']);
        this.stepEditionModal = true;
      }
    },
    async editStep () {
      try {
        this.modalLoading = true;
        this.v$.editedStep.$touch();
        if (this.v$.editedStep.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Steps.updateById(this.editedStep._id, pick(this.editedStep, ['name', 'theoreticalHours']));
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
      this.editedStep = { name: '', theoreticalHours: 0 };
      this.v$.editedStep.$reset();
    },
    // ACTIVITY
    goToActivityProfile (subProgram, step, activity) {
      this.$router.push({
        name: 'ni pedagogy activity info',
        params: {
          programId: this.program._id,
          subProgramId: subProgram._id,
          stepId: step._id,
          activityId: activity._id,
        },
      });
    },
    // activity creation
    openActivityCreationModal (stepId) {
      this.activityCreationModal = true;
      this.currentStepId = stepId;
    },
    async createActivity () {
      try {
        this.modalLoading = true;
        this.v$.newActivity.$touch();
        if (this.v$.newActivity.$error) return NotifyWarning('Champ(s) invalide(s)');
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
      this.newActivity.name = '';
      this.v$.newActivity.$reset();
    },
    // activity reuse
    openActivityReuseModal (step) {
      this.currentStepId = step._id;
      this.sameStepActivities = step.activities.map(a => a._id);
      this.activityReuseModal = true;
    },
    async refreshProgramList () {
      try {
        const programs = await Programs.list();

        this.programOptions = programs.map(p => ({ label: p.name, value: p._id }));
      } catch (e) {
        this.programOptions = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des programmes.');
      }
    },
    async reuseActivity () {
      try {
        this.modalLoading = true;

        this.v$.reusedActivity.$touch();
        if (this.v$.reusedActivity.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Steps.reuseActivity(this.currentStepId, { activities: this.reusedActivity });
        this.activityReuseModal = false;
        await this.refreshProgram();
        NotifyPositive('Activité réutilisée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la réutilisation de l\'activité.');
      } finally {
        this.modalLoading = false;
      }
    },
    async duplicateActivity () {
      try {
        this.modalLoading = true;

        this.v$.reusedActivity.$touch();
        if (this.v$.reusedActivity.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Steps.addActivity(this.currentStepId, { activityId: this.reusedActivity });
        this.activityReuseModal = false;
        await this.refreshProgram();
        NotifyPositive('Activité dupliquée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la dupliquation de l\'activité.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetActivityReuseModal () {
      this.reusedActivity = '';
      this.v$.reusedActivity.$reset();
    },
    validateStepDetachment (subProgramId, stepId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir retirer cette étape de ce sous-programme ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.detachStep(subProgramId, stepId))
        .onCancel(() => NotifyPositive('Retrait annulé.'));
    },
    async detachStep (subProgramId, stepId) {
      try {
        await SubPrograms.detachStep(subProgramId, stepId);
        await this.refreshProgram();
        NotifyPositive('Étape retirée.');
      } catch (e) {
        console.error(e);
        if (e.status === 409) {
          return NotifyWarning('Certains créneaux de formation sont encore rattachés à cette étape.');
        }
        return NotifyNegative('Erreur lors du retrait de l\'étape.');
      }
    },
    validateActivityDeletion (step, activityId) {
      if (this.isLocked(step)) {
        this.openNextModalAfterUnlocking = () => this.validateActivityDeletion(step, activityId);
        this.openValidateUnlockingEditionModal(step);
      } else {
        this.$q.dialog({
          title: 'Confirmation',
          message: 'Êtes-vous sûr(e) de vouloir retirer cette activité de cette étape ?',
          ok: true,
          cancel: 'Annuler',
        }).onOk(() => this.detachActivity(step._id, activityId))
          .onCancel(() => NotifyPositive('Retrait annulé.'));
      }
    },
    async detachActivity (stepId, activityId) {
      try {
        await Steps.detachActivity(stepId, activityId);
        await this.refreshProgram();
        NotifyPositive('Activité détachée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors du retrait de l\'activité.');
      }
    },
    scrollToOpenedStep (openedStep) {
      const el = document.getElementById(openedStep);
      el.scrollIntoView({ behavior: 'smooth' });
    },
    async checkPublicationAndOpenModal (subProgram) {
      this.subProgramToPublish = subProgram;

      const eLearningSubProgramAlreadyPublished = this.program.subPrograms.some(
        sp => sp.isStrictlyELearning && sp._id !== subProgram._id && sp.status === PUBLISHED
      );
      if (subProgram.isStrictlyELearning && eLearningSubProgramAlreadyPublished) {
        return NotifyWarning('Un programme ne peut contenir qu\'un seul sous programme eLearning publié.');
      }

      if (!subProgram.areStepsValid) return NotifyWarning('Le sous-programme n\'est pas valide.');

      return subProgram.isStrictlyELearning
        ? this.openSubProgramPublicationModal()
        : this.validateSubProgramPublication();
    },
    validateSubProgramPublication (accessCompany = null) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Une fois le sous-programme publié, vous ne pourrez plus le modifier.<br />'
          + 'Êtes-vous sûr(e) de vouloir publier ce sous-programme ?',
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.publishSubProgram(accessCompany))
        .onCancel(() => NotifyPositive('Publication annulée.'));
    },
    async publishSubProgram (accessCompany) {
      const payload = accessCompany ? { status: PUBLISHED, accessCompany } : { status: PUBLISHED };
      try {
        await SubPrograms.update(this.subProgramToPublish._id, payload);
        NotifyPositive('Sous programme publié');
        this.refreshProgram();
        this.subProgramPublicationModal = false;
      } catch (e) {
        console.error(e);
        if (e.status === 409) {
          return NotifyWarning('Un programme ne peut contenir qu\'un seul sous programme eLearning publié.');
        }

        NotifyNegative('Erreur lors de la publication du sous-programme.');
      }
    },
    isPublished (element) {
      return element.status === PUBLISHED;
    },
    isLocked (step) {
      return this.areStepsLocked[step._id];
    },
    isPublishedOrLocked (step) {
      return this.isPublished(step) || this.isLocked(step);
    },
    isReused (step) {
      return step.subPrograms && step.subPrograms.length > 1;
    },
    initAreStepsLocked () {
      const steps = this.program.subPrograms
        .map(sp => sp.steps.map(step => ({ [step._id]: this.isReused(step) })))
        .flat();
      this.areStepsLocked = steps.length ? Object.assign(...steps) : {};
    },
    async openSubProgramPublicationModal () {
      try {
        const companies = await Companies.list();
        this.companyOptions = formatAndSortOptions(companies, 'name');
        this.subProgramPublicationModal = true;
      } catch (e) {
        console.error(e);
        this.subProgramPublicationModal = false;
        this.companyOptions = [];
      }
    },
    resetPublication () {
      this.subProgramToPublish = null;
    },
    resetValidateUnlockingEditionModal () {
      this.openNextModalAfterUnlocking = () => null;
      this.stepToBeUnlocked = { _id: '', status: '' };
      this.subProgramsReusingStepToBeUnlocked = [];
    },
    getSubProgramsReusingStep (step) {
      return Object.values(groupBy(step.subPrograms, 'program._id'))
        .map(groupSp => ({
          programName: groupSp[0].program.name,
          subProgramsName: groupSp.map(sP => sP.name).sort(sortStrings),
        }))
        .sort((a, b) => sortStrings(a.programName, b.programName));
    },
    openValidateUnlockingEditionModal (step) {
      if (!this.isLocked(step)) return;

      this.stepToBeUnlocked = pick(step, ['_id', 'status']);
      this.subProgramsReusingStepToBeUnlocked = this.getSubProgramsReusingStep(step);
      this.validateUnlockingEditionModal = true;
    },
    confirmUnlocking () {
      this.setStepLocking(this.stepToBeUnlocked, false);
      this.openNextModalAfterUnlocking();
      this.validateUnlockingEditionModal = false;
      NotifyPositive('Étape déverrouillée.');
    },
    cancelUnlocking () {
      this.validateUnlockingEditionModal = false;
      NotifyPositive('Déverrouillage annulé.');
    },
    formatDurationFromFloat,
    isStepValid (step) {
      return step.areActivitiesValid && !!step.theoreticalHours ? PUBLISHED_DOT_ACTIVE : PUBLISHED_DOT_WARNING;
    },
  },
};
</script>

<style lang="sass" scoped>
.sub-program-container
  display: flex
  flex-direction: column

.sub-program-footer
  display: flex
  justify-content: space-between

.published-sub-program
  font-size: 14px
  border-radius: 15px
  padding: 1px 6px
  color: white
  margin-left: 10px

.step
  border-radius: 0
  &-head
    justify-content: space-between
    .step-info
      display: flex
      flex: 1
  &-subtitle
    font-size: 13px
  &-lock
    background-color: $copper-grey-100
  &-title
    min-height: 28px

.add-step-button
  align-self: flex-end

.activity-container
  display: flex
  flex-direction: column
  align-items: flex-end

.activity-draggable
  width: -moz-available
  width: -webkit-fill-available

.activity
  margin: 8px 8px 8px 48px
  border-radius: 0
  &-info
    flex: 1
    align-items: center
  .q-card__section
    display: flex
    justify-content: space-between
    align-items: center
  .q-card__section--vert
    padding: 3px 3px 3px 10px
  .activity-content
    font-size: 12px
.q-btn
    width: fit-content

.q-card
  .q-card__section
    .q-item__section--side
      padding-right: 10px

.no-activity
  color: $copper-grey-700
  font-size: 14px
  margin: 10px

.ghost
  opacity: 0.5
</style>
