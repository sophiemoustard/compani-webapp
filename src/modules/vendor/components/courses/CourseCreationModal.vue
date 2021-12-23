<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template #title>
        Créer une nouvelle <span class="text-weight-bold">formation</span>
      </template>
      <ni-option-group :value="newCourse.type" @input="updateType($event)" type="radio" :options="courseTypes"
        caption="Type" required-field inline :error="validations.type.$error" />
      <ni-select in-modal :value="newCourse.salesRepresentative" @input="update($event, 'salesRepresentative')"
        @blur="validations.salesRepresentative.$touch" :error="validations.salesRepresentative.$error" required-field
        caption="Référent Compani" :options="salesRepresentativeOptions" />
      <ni-select in-modal :value="newCourse.program" @input="update($event, 'program')" :options="programOptions"
        @blur="validations.program.$touch" required-field caption="Programme" :error="validations.program.$error" />
      <ni-select in-modal :value="newCourse.subProgram" @input="update($event, 'subProgram')"
        @blur="validations.subProgram.$touch" required-field caption="Sous-programme" :options="subProgramOptions"
        :disable="disableSubProgram" :error="validations.subProgram.$error" />
      <ni-select v-if="isIntraCourse" in-modal :value="newCourse.company" @input="update($event, 'company')"
        @blur="validations.company.$touch" required-field caption="Structure" :options="companyOptions"
        :error="validations.company.$error" />
      <ni-input in-modal :value="newCourse.misc" @input="update($event.trim(), 'misc')"
        caption="Informations Complémentaires" />
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
import OptionGroup from '@components/form/OptionGroup';
import Input from '@components/form/Input';
import { COURSE_TYPES } from '@data/constants';
import { formatAndSortOptions } from '@helpers/utils';

export default {
  name: 'CourseCreationModal',
  props: {
    value: { type: Boolean, default: false },
    isIntraCourse: { type: Boolean, default: false },
    newCourse: { type: Object, default: () => ({}) },
    programs: { type: Array, default: () => [] },
    companyOptions: { type: Array, default: () => [] },
    salesRepresentativeOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-option-group': OptionGroup,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
  },
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
        .map(p => ({ label: p.name, value: p._id, disable: !get(p, 'subPrograms.length') }))
        .sort((a, b) => a.label.localeCompare(b.label));
    },
  },
  watch: {
    'newCourse.program': function (value) {
      const selectedProgram = this.programs.find(p => p._id === value);

      if (get(selectedProgram, 'subPrograms.length')) {
        this.disableSubProgram = false;
        this.subProgramOptions = formatAndSortOptions(selectedProgram.subPrograms, 'name');

        if (this.subProgramOptions.length === 1) this.update(this.subProgramOptions[0].value, 'subProgram');
      } else {
        this.subProgramOptions = [];
        this.update('', 'subProgram');
        this.disableSubProgram = true;
      }
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    updateType (event) {
      this.$emit('update:newCourse', { ...omit(this.newCourse, 'company'), type: event });
    },
    update (event, prop) {
      this.$emit('update:newCourse', { ...this.newCourse, [prop]: event });
    },
  },
};
</script>
