<template>
  <div v-if="program">
    <div class="q-mb-xl">
      <p class="text-weight-bold">Étapes ({{ program.steps.length }})</p>
      <q-card v-for="(step, index) of program.steps" :key="index" flat class="step">
        <q-card-section class="step-head cursor-pointer row" @click="showActivities(step._id)">
          <q-item-section side><q-icon :name="getStepTypeIcon(step.type)" size="sm" color="black" /></q-item-section>
          <q-item-section>
            <div class="text-weight-bold">{{step.name}}</div>
            <div class="step-subtitle">
              {{ getStepTypeLabel(step.type) }} -
              {{ step.activities.length }} activité{{ step.activities.length > 1 ? 's' : '' }}
            </div>
          </q-item-section>
          <q-btn flat small color="grey" icon="edit" @click.stop="openStepEditionModal(step)" />
        </q-card-section>
        <div class="beige-background activity-container" v-if="isActivitiesShown[step._id]">
          <q-card v-for="(activity, index) of step.activities" :key="index" flat class="activity">
            <q-card-section class="cursor-pointer row" @click="goToActivityProfile(step, activity)">
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
      <ni-select in-modal caption="Type" :options="activityTypeOptions" v-model="newActivity.type" required-field
        :error="$v.newActivity.type.$error" />
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
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import pick from 'lodash/pick';
import Programs from '@api/Programs';
import Steps from '@api/Steps';
import Activities from '@api/Activities';
import { formatQuantity } from '@helpers/utils';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { E_LEARNING, ON_SITE, LESSON, QUIZ, SHARING_EXPERIENCE, VIDEO } from '@data/constants';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
    'ni-option-group': OptionGroup,
    'ni-modal': Modal,
    'ni-select': Select,
  },
  data () {
    return {
      modalLoading: false,
      stepCreationModal: false,
      newStep: { name: '', type: E_LEARNING },
      stepEditionModal: false,
      editedStep: { name: '', type: E_LEARNING },
      activityCreationModal: false,
      newActivity: { name: '' },
      activityEditionModal: false,
      editedActivity: { name: '' },
      isActivitiesShown: {},
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
    }
  },
  validations () {
    return {
      newStep: { name: { required }, type: { required } },
      editedStep: { name: { required } },
      newActivity: { name: { required }, type: { required } },
      editedActivity: { name: { required } },
    }
  },
  computed: {
    ...mapState('program', ['program']),
  },
  async mounted () {
    if (!this.program) await this.refreshProgram();
  },
  methods: {
    getStepTypeLabel (value) {
      const type = this.stepTypeOptions.find(type => type.value === value);
      return type ? type.label : '';
    },
    getStepTypeIcon (type) {
      return type === E_LEARNING ? 'stay_current_portrait' : 'mdi-teach';
    },
    getActivityTypeLabel (value) {
      const type = this.activityTypeOptions.find(type => type.value === value);
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
        NotifyNegative("Erreur lors de la modification de l'activité.");
      } finally {
        this.modalLoading = false;
      }
    },
    resetActivityEditionModal () {
      this.editedActivity = { name: '' };
      this.$v.editedActivity.$reset();
    },
  },
}
</script>

<style lang="stylus" scoped>
.step
  margin-bottom: 10px
  border-radius: 0
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
