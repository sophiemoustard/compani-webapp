<template>
  <ni-modal :value="value" @hide="hide" @input="input" container-class="modal-container-md">
    <template slot="title">
        Ajouter une nouvelle <span class="text-weight-bold">étape</span>
      </template>
      <ni-btn-toggle :value="additionType" :options="STEP_ATTACHEMENT_OPTIONS" @input="updateAdditionType($event)" />
      <template v-if="additionType === CREATE_STEP">
        <ni-option-group inline caption="Type" :value="newStep.type" type="radio" :options="STEP_TYPES"
          required-field @input="updateNewStep($event, 'type')" />
        <ni-input in-modal :value="newStep.name" :error="validations.newStep.name.$error" required-field caption="Nom"
          @input="updateNewStep($event.trim(), 'name')" @blur="validations.newStep.name.$touch" />
      </template>
      <template v-else-if="additionType === REUSE_STEP">
        <ni-select in-modal v-model.trim="selectedProgram" caption="Programme" required-field :options="programOptions"
        inline @input="refreshSteps" />
        <ni-option-group inline required-field caption="Étapes" :value="reusedStep" type="radio" :options="stepOptions"
          @input="updateReusedStep($event, '_id')" :error="validations.reusedStep.$error" />
      </template>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" :label="submitLabel" color="primary" :loading="loading"
          icon-right="add" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import ButtonToggle from '@components/ButtonToggle';
import OptionGroup from '@components/form/OptionGroup';
import Select from '@components/form/Select';
import { NotifyNegative } from '@components/popup/notify';
import { STEP_TYPES, STEP_ATTACHEMENT_OPTIONS, CREATE_STEP, REUSE_STEP } from '@data/constants';
import Programs from '@api/Programs';

export default {
  name: 'StepAdditionModal',
  props: {
    value: { type: Boolean, default: false },
    newStep: { type: Object, default: () => ({}) },
    reusedStep: { type: String, default: '' },
    programId: { type: String, default: '' },
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
      selectedProgram: this.programId,
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
        if (!this.programOptions.length) this.refreshProgramList();
        if (!this.stepOptions.length) this.refreshSteps();
      }
    },
  },
  methods: {
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
    async refreshSteps () {
      try {
        if (!this.selectedProgram) return;
        const steps = await Programs.getSteps(this.selectedProgram);

        this.stepOptions = steps.map(s => ({ label: s.name, value: s._id }));
      } catch (e) {
        this.stepOptions = [];
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des étapes de ce programme.');
      }
    },
    hide () {
      this.$emit('hide');
      this.selectedProgram = this.programId;
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    updateNewStep (event, prop) {
      this.$emit('update:newStep', { ...this.newStep, [prop]: event });
    },
    updateReusedStep (value) {
      this.$emit('update:reusedStep', value);
    },
    updateAdditionType (value) {
      this.$emit('update:additionType', value);
    },
  },
};
</script>
