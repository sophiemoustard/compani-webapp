<template>
  <div v-if="program">
    <div v-for="(subProgram, index) of program.subPrograms" class="q-mb-xl sub-program-container" :key="index">
      <p class="text-weight-bold">Sous-programme {{ index + 1 }}</p>
      <ni-input v-model.trim="program.subPrograms[index].name" required-field caption="Nom" @focus="saveTmpName(index)"
        @blur="updateSubProgramName(index)" :error="$v.program.subPrograms.$each[index].name.$error" />
      <q-card v-for="(step, stepIndex) of subProgram.steps" :key="stepIndex" flat class="step">
        <q-card-section class="step-head cursor-pointer row" @click="showActivities(step._id)">
          <q-item-section side><q-icon :name="getStepTypeIcon(step.type)" size="sm" color="black" /></q-item-section>
          <q-item-section>
            <div class="text-weight-bold">{{ step.name }}</div>
            <div class="step-subtitle">
              {{ getStepTypeLabel(step.type) }} -
              {{ step.activities.length }} activité{{ step.activities.length > 1 ? 's' : '' }}
            </div>
          </q-item-section>
          <q-btn flat small color="grey" icon="edit" @click.stop="openStepEditionModal(step)" />
        </q-card-section>
        <div class="beige-background activity-container" v-if="isActivitiesShown[step._id]">
          <q-card v-for="(activity, actIndex) of step.activities" :key="actIndex" flat class="activity">
            <q-card-section class="cursor-pointer row" @click="goToActivityProfile(subProgram, step, activity)">
              <div class="col-xs-9 col-sm-6">{{ activity.name }}</div>
              <div class="gt-xs col-sm-2 activity-content">{{ getActivityTypeLabel(activity.type) }}</div>
              <div class="gt-xs col-sm-2 activity-content"> {{ formatQuantity('carte', activity.cards.length) }}</div>
              <q-btn flat small color="grey" icon="edit" @click.stop="openActivityEditionModal(activity)" />
            </q-card-section>
          </q-card>
          <q-btn class="q-my-sm" flat no-caps color="primary" icon="add" label="Ajouter une activité"
            @click="openActivityCreationModal(step._id)" />
        </div>
      </q-card>
      <q-btn class="q-my-sm add-step-button" flat no-caps color="primary" icon="add" label="Ajouter une étape"
        @click="openStepCreationModal(subProgram._id)" />
    </div>

    <q-btn class="fixed fab-custom" no-caps rounded color="primary" icon="add" label="Ajouter un sous programme"
      @click="subProgramCreationModal = true" />

    <!-- Sub-program creation modal -->
    <sub-program-creation-modal v-model="subProgramCreationModal" :new-sub-program="newSubProgram"
      :validations="$v.newSubProgram" @hide="resetSubProgramCreationModal" @submit="createSubProgram" />

    <!-- Step creation modal -->
    <step-creation-modal v-model="stepCreationModal" :new-step="newStep" :step-type-options="stepTypeOptions"
      :validations="$v.newStep" @hide="resetStepCreationModal" @submit="createStep" />

    <!-- Step edition modal -->
    <step-edition-modal v-model="stepEditionModal" :edited-step="editedStep" :validations="$v.editedStep"
      @hide="resetStepEditionModal" @submit="editStep" />

    <!-- Activity creation modal -->
    <activity-creation-modal v-model="activityCreationModal" :new-activity="newActivity" :validations="$v.newActivity"
      :activity-type-options="activityTypeOptions" @hide="resetActivityCreationModal" @submit="createActivity" />

    <!-- Activity edition modal -->
    <activity-edition-modal v-model="activityEditionModal" :edited-activity="editedActivity"
      :validations="$v.editedActivity" @hide="resetActivityEditionModal" @submit="editActivity" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import pick from 'lodash/pick';
import get from 'lodash/get';
import Programs from '@api/Programs';
import SubPrograms from '@api/SubPrograms';
import Steps from '@api/Steps';
import Activities from '@api/Activities';
import { formatQuantity } from '@helpers/utils';
import Input from '@components/form/Input';
import SubProgramCreationModal from 'src/modules/vendor/components/programs/SubProgramCreationModal';
import StepCreationModal from 'src/modules/vendor/components/programs/StepCreationModal';
import StepEditionModal from 'src/modules/vendor/components/programs/StepEditionModal';
import ActivityCreationModal from 'src/modules/vendor/components/programs/ActivityCreationModal';
import ActivityEditionModal from 'src/modules/vendor/components/programs/ActivityEditionModal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { E_LEARNING, ON_SITE, LESSON, QUIZ, SHARING_EXPERIENCE, VIDEO } from '@data/constants';

export default {
  name: 'ProfileContent',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-input': Input,
    'sub-program-creation-modal': SubProgramCreationModal,
    'step-creation-modal': StepCreationModal,
    'step-edition-modal': StepEditionModal,
    'activity-creation-modal': ActivityCreationModal,
    'activity-edition-modal': ActivityEditionModal,
  },
  data () {
    return {
      tmpInput: '',
      modalLoading: false,
      subProgramCreationModal: false,
      newSubProgram: { name: '' },
      stepCreationModal: false,
      newStep: { name: '', type: E_LEARNING },
      stepEditionModal: false,
      editedStep: { name: '', type: E_LEARNING },
      activityCreationModal: false,
      newActivity: { name: '' },
      activityEditionModal: false,
      editedActivity: { name: '' },
      isActivitiesShown: {},
      currentSubProgramId: '',
      currentStepId: '',
      stepTypeOptions: [
        { label: 'eLearning', value: E_LEARNING },
        { label: 'Présentiel', value: ON_SITE },
      ],
      activityTypeOptions: [
        { label: 'Cours', value: LESSON },
        { label: 'Quiz', value: QUIZ },
        { label: 'Témoignage', value: SHARING_EXPERIENCE },
        { label: 'Vidéo', value: VIDEO },
      ],
      formatQuantity,
    };
  },
  validations () {
    return {
      program: { subPrograms: { $each: { name: { required } } } },
      newSubProgram: { name: { required } },
      newStep: { name: { required }, type: { required } },
      editedStep: { name: { required } },
      newActivity: { name: { required }, type: { required } },
      editedActivity: { name: { required } },
    };
  },
  computed: {
    ...mapState('program', ['program']),
  },
  async mounted () {
    if (!this.program) await this.refreshProgram();
  },
  methods: {
    saveTmpName (index) {
      this.tmpInput = this.program.subPrograms[index] ? this.program.subPrograms[index].name : '';
    },
    getStepTypeLabel (value) {
      const type = this.stepTypeOptions.find(t => t.value === value);
      return type ? type.label : '';
    },
    getStepTypeIcon (type) {
      return type === E_LEARNING ? 'stay_current_portrait' : 'mdi-teach';
    },
    getActivityTypeLabel (value) {
      const type = this.activityTypeOptions.find(t => t.value === value);
      return type ? type.label : '';
    },
    showActivities (stepId) {
      this.$set(this.isActivitiesShown, stepId, !this.isActivitiesShown[stepId]);
    },
    async refreshProgram () {
      try {
        await this.$store.dispatch('program/fetchProgram', { programId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    async updateSubProgramName (index) {
      try {
        const subProgramName = get(this.program.subPrograms[index], 'name');
        const subProgramId = get(this.program.subPrograms[index], '_id');

        if (this.tmpInput === subProgramName) return;
        this.$v.program.$touch();
        if (this.$v.program.$error) return NotifyWarning('Champ(s) invalide(s)');

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
        this.$v.newSubProgram.$touch();
        if (this.$v.newSubProgram.$error) return NotifyWarning('Champ(s) invalide(s)');
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
      this.$v.newSubProgram.$reset();
    },
    async openStepCreationModal (subProgramId) {
      this.stepCreationModal = true;
      this.currentSubProgramId = subProgramId;
    },
    async createStep () {
      try {
        this.modalLoading = true;
        this.$v.newStep.$touch();
        if (this.$v.newStep.$error) return NotifyWarning('Champ(s) invalide(s)');
        await SubPrograms.addStep(this.currentSubProgramId, this.newStep);
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
      this.newStep.name = '';
      this.$v.newStep.$reset();
    },
    async openStepEditionModal (step) {
      this.editedStep = pick(step, ['_id', 'name', 'type']);
      this.stepEditionModal = true;
    },
    async editStep () {
      try {
        this.modalLoading = true;
        this.$v.editedStep.$touch();
        if (this.$v.editedStep.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Steps.updateById(this.editedStep._id, pick(this.editedStep, ['name']));
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
      this.editedStep = { name: '' };
      this.$v.editedStep.$reset();
    },
    goToActivityProfile (subProgram, step, activity) {
      this.$router.push({
        name: 'ni config activity info',
        params: {
          programId: this.program._id,
          subProgramId: subProgram._id,
          stepId: step._id,
          activityId: activity._id,
        },
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
      this.newActivity.name = '';
      this.$v.newActivity.$reset();
    },
    async openActivityEditionModal (activity) {
      this.editedActivity = pick(activity, ['_id', 'name']);
      this.activityEditionModal = true;
    },
    async editActivity () {
      try {
        this.modalLoading = true;
        this.$v.editedActivity.$touch();
        if (this.$v.editedActivity.$error) return NotifyWarning('Champ(s) invalide(s)');

        await Activities.updateById(this.editedActivity._id, pick(this.editedActivity, ['name']));
        this.activityEditionModal = false;
        await this.refreshProgram();
        NotifyPositive('Activité modifiée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification de l\'activité.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetActivityEditionModal () {
      this.editedActivity = { name: '' };
      this.$v.editedActivity.$reset();
    },
  },
};
</script>

<style lang="stylus" scoped>

.sub-program-container
  display: flex
  flex-direction: column

.step
  margin-bottom: 10px
  border-radius: 0
  &-head
    justify-content: space-between
  &-subtitle
    font-size: 13px

.add-step-button
  align-self: flex-end

.activity-container
  display: flex
  flex-direction: column
  align-items: flex-end
.activity
  width: -moz-available
  width: -webkit-fill-available
  margin: 10px 10px 0px 50px
  border-radius: 0
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
</style>
