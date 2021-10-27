<template>
  <ni-modal :value="value" @hide="hide" @input="input" container-class="modal-container-md">
    <template slot="title">
        Ajouter une nouvelle <span class="text-weight-bold">étape</span>
      </template>
      <ni-btn-toggle :value="additionType" :options="STEP_ATTACHEMENT_OPTIONS" @input="updateAdditionType($event)" />
      <template v-if="additionType === CREATE_STEP">
        <ni-option-group inline caption="Type" :value="newStep.type" type="radio" :options-groups="[STEP_TYPES]"
          required-field @input="updateNewStep($event, 'type')" />
        <ni-input in-modal :value="newStep.name" :error="validations.newStep.name.$error" required-field caption="Nom"
          @input="updateNewStep($event.trim(), 'name')" @blur="validations.newStep.name.$touch" />
      </template>
      <template v-else-if="additionType === REUSE_STEP">
        <ni-select in-modal :value="reusedStep.program" caption="Programme" required-field :options="programOptions"
        inline @input="updateProgram($event)" :error="validations.reusedStep.program.$error" />
        <ni-option-group inline required-field caption="Étapes" :value="reusedStep._id" type="radio"
          :options-groups="stepOptions" @input="updateReusedStep($event)" :group-titles="stepGroups"
          :error="validations.reusedStep._id.$error" />
      </template>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" :label="submitLabel" color="primary" :loading="loading"
          icon-right="add" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import get from 'lodash/get';
import groupBy from 'lodash/groupBy';
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import ButtonToggle from '@components/ButtonToggle';
import OptionGroup from '@components/form/OptionGroup';
import Select from '@components/form/Select';
import { NotifyNegative } from '@components/popup/notify';
import { STEP_TYPES, STEP_ATTACHEMENT_OPTIONS, CREATE_STEP, REUSE_STEP } from '@data/constants';
import Programs from '@api/Programs';
import Steps from '@api/Steps';
import { formatAndSortOptions } from '@helpers/utils';
import { courseMixin } from '@mixins/courseMixin';

export default {
  name: 'StepAdditionModal',
  mixins: [courseMixin],
  props: {
    value: { type: Boolean, default: false },
    newStep: { type: Object, default: () => ({}) },
    reusedStep: { type: Object, default: () => ({}) },
    program: { type: Object, default: () => ({}) },
    subProgramId: { type: String, default: () => '' },
    additionType: { type: String, default: CREATE_STEP },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-option-group': OptionGroup,
    'ni-btn-toggle': ButtonToggle,
    'ni-select': Select,
  },
  data () {
    return {
      STEP_TYPES,
      STEP_ATTACHEMENT_OPTIONS,
      CREATE_STEP,
      REUSE_STEP,
      stepOptions: [],
      programOptions: [],
      stepGroups: [],
    };
  },
  computed: {
    submitLabel () {
      return this.additionType === CREATE_STEP ? 'Créer l\'étape' : 'Réutiliser l\'étape';
    },
  },
  watch: {
    additionType () {
      if (this.additionType === REUSE_STEP) {
        if (!this.reusedStep.program) this.updateProgram(this.program._id);
        if (!this.programOptions.length) this.refreshPrograms();
        if (!this.stepOptions.length) this.refreshSteps();
      }
    },
  },
  methods: {
    async refreshPrograms () {
      try {
        const programs = await Programs.list();

        this.programOptions = formatAndSortOptions(programs, 'name');
      } catch (e) {
        this.programOptions = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des programmes.');
      }
    },
    formatAndSortStepOptions (array) {
      const stepsInSubProgram = this.program.subPrograms
        .find(subProgram => subProgram._id === this.subProgramId)
        .steps.map(step => step._id);

      return array
        .map(element => ({
          label: stepsInSubProgram.includes(element._id)
            ? `${get(element, 'name')} (déjà utilisée)`
            : get(element, 'name'),
          value: element._id,
          disable: stepsInSubProgram.includes(element._id),
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    async refreshSteps () {
      try {
        if (!this.reusedStep.program) {
          this.stepOptions = [];
          this.stepGroups = [];
          return;
        }
        const steps = await Steps.list({ program: this.reusedStep.program });
        const stepsGroupedByType = groupBy(steps, 'type');
        this.stepOptions = Object.keys(stepsGroupedByType)
          .map(group => this.formatAndSortStepOptions(stepsGroupedByType[group]));
        this.stepGroups = Object.keys(stepsGroupedByType)
          .map(group => ({ label: this.getStepTypeLabel(group), icon: this.getStepTypeIcon(group) }));
      } catch (e) {
        this.stepOptions = [];
        this.stepGroups = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des étapes de ce programme.');
      }
    },
    hide () {
      this.$emit('hide');
      this.stepOptions = [];
      this.stepGroups = [];
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    updateNewStep (event, prop) {
      this.$emit('update:newStep', set(this.newStep, prop, event));
    },
    async updateProgram (event) {
      await this.$emit('update:reusedStep', { _id: '', program: event });
      await this.refreshSteps();
    },
    updateReusedStep (value) {
      this.$emit('update:reusedStep', set(this.reusedStep, '_id', value));
    },
    updateAdditionType (value) {
      this.$emit('update:additionType', value);
    },
  },
};
</script>

<style lang="stylus" scoped>
/deep/.q-option-group
  display: flex
  flex-direction: column
</style>
