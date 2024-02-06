<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
        Créer une nouvelle <span class="text-weight-bold">formation</span>
      </template>
      <ni-option-group :model-value="newCourse.type" @update:model-value="updateType($event)" type="radio"
        caption="Type" required-field inline :error="validations.type.$error" :options="courseTypes" />
      <ni-select in-modal :model-value="newCourse.operationsRepresentative" caption="Chargé(e) des opérations"
        @update:model-value="update($event, 'operationsRepresentative')" :options="adminUserOptions"
        @blur="validations.operationsRepresentative.$touch" :error="validations.operationsRepresentative.$error"
        required-field />
      <ni-select in-modal :model-value="newCourse.program" @update:model-value="update($event, 'program')"
        @blur="validations.program.$touch" required-field caption="Programme" :error="validations.program.$error"
        :options="programOptions" />
      <ni-select in-modal :model-value="newCourse.subProgram" @update:model-value="update($event, 'subProgram')"
        @blur="validations.subProgram.$touch" required-field caption="Sous-programme" :options="subProgramOptions"
        :disable="disableSubProgram" :error="validations.subProgram.$error" />
      <ni-select v-if="isIntraCourse" in-modal :model-value="newCourse.company"
        @blur="validations.company.$touch" required-field caption="Structure" :options="companyOptions"
        :error="validations.company.$error" @update:model-value="update($event, 'company')" />
      <ni-select v-if="isIntraHoldingCourse" in-modal :model-value="newCourse.holding"
        @blur="validations.holding.$touch" required-field caption="Société mère" :options="holdingOptions"
        :error="validations.holding.$error" @update:model-value="update($event, 'holding')" />
      <ni-date-input caption="Date de démarrage souhaitée" :model-value="newCourse.estimatedStartDate" in-modal
        @update:model-value="update($event, 'estimatedStartDate')" />
      <ni-input v-if="isIntraCourse || isIntraHoldingCourse" in-modal required-field type="number"
        caption="Nombre d'inscrits max" :model-value="newCourse.maxTrainees" @blur="validations.maxTrainees.$touch"
        :error="validations.maxTrainees.$error" :error-message="maxTraineesErrorMessage"
        @update:model-value="update($event, 'maxTrainees')" />
      <ni-input v-if="isIntraCourse" :model-value="newCourse.expectedBillsCount" in-modal required-field type="number"
        @update:model-value="update($event, 'expectedBillsCount')" caption="Nombre de factures"
        :error="validations.expectedBillsCount.$error" :error-message="expectedBillsCountErrorMessage"
        @blur="validations.expectedBillsCount.$touch" />
      <ni-input in-modal :model-value="newCourse.misc" @update:model-value="update($event.trim(), 'misc')"
        caption="Informations Complémentaires" />
      <q-checkbox in-modal :model-value="newCourse.hasCertifyingTest" label="La formation est certifiante" dense
        @update:model-value="update($event, 'hasCertifyingTest')" class="q-mb-lg" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Créer la formation" color="primary" :loading="loading"
          icon-right="add" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import get from 'lodash/get';
import omit from 'lodash/omit';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import DateInput from '@components/form/DateInput';
import OptionGroup from '@components/form/OptionGroup';
import Input from '@components/form/Input';
import { COURSE_TYPES, REQUIRED_LABEL, INTRA, INTRA_HOLDING, PUBLISHED } from '@data/constants';
import { formatAndSortOptions } from '@helpers/utils';

export default {
  name: 'CourseCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newCourse: { type: Object, default: () => ({}) },
    programs: { type: Array, default: () => [] },
    companyOptions: { type: Array, default: () => [] },
    holdingOptions: { type: Array, default: () => [] },
    adminUserOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-option-group': OptionGroup,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
    'ni-date-input': DateInput,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-course'],
  data () {
    return {
      courseTypes: COURSE_TYPES,
      subProgramOptions: [],
      disableSubProgram: false,
    };
  },
  computed: {
    programOptions () {
      return this.programs
        .map((p) => {
          const blendedPublishedSubPrograms = p.subPrograms
            .filter(sp => !sp.isStrictlyELearning && sp.status === PUBLISHED);

          return {
            label: p.name,
            value: p._id,
            disable: !blendedPublishedSubPrograms.length,
            blendedPublishedSubPrograms,
          };
        })
        .sort((a, b) => a.label.localeCompare(b.label));
    },
    maxTraineesErrorMessage () {
      if (get(this.validations, 'maxTrainees.required.$response') === false) return REQUIRED_LABEL;
      if (get(this.validations, 'maxTrainees.strictPositiveNumber.$response') === false ||
        get(this.validations, 'maxTrainees.integerNumber.$response') === false) {
        return 'Nombre non valide';
      }
      return '';
    },
    expectedBillsCountErrorMessage () {
      if (this.validations.expectedBillsCount.required.$response === false) return REQUIRED_LABEL;
      return 'Nombre non valide';
    },
    isIntraCourse () { return this.newCourse.type === INTRA; },
    isIntraHoldingCourse () { return this.newCourse.type === INTRA_HOLDING; },
  },
  watch: {
    'newCourse.program': function (value) {
      const selectedProgram = this.programOptions.find(p => p.value === value);
      if (selectedProgram) {
        const { blendedPublishedSubPrograms } = selectedProgram;

        this.subProgramOptions = formatAndSortOptions(blendedPublishedSubPrograms, 'name');
        this.disableSubProgram = !this.subProgramOptions.length;
        if (this.subProgramOptions.length === 1) this.update(this.subProgramOptions[0].value, 'subProgram');
        else this.update('', 'subProgram');
      }
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    updateType (event) {
      this.$emit(
        'update:new-course',
        {
          ...omit(this.newCourse, ['company', 'holding', 'maxTrainees', 'expectedBillsCount']),
          ...(event === INTRA && { maxTrainees: '8', expectedBillsCount: '0' }),
          ...(event === INTRA_HOLDING && { maxTrainees: '8' }),
          type: event,
        }
      );
    },
    update (event, prop) {
      this.$emit('update:new-course', { ...this.newCourse, [prop]: event });
    },
  },
};
</script>
