<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">formation</span>
      </template>
      <ni-option-group v-model="newCourse.type" type="radio" :options="courseTypes" :error="validations.type.$error"
        caption="Type" required-field inline @input="update" />
      <ni-select in-modal v-model.trim="newCourse.program" :error="validations.program.$error"
        @blur="validations.program.$touch" required-field caption="Programme" :options="programOptions" />
      <ni-select in-modal v-model.trim="newCourse.subProgram" :error="validations.subProgram.$error"
        @blur="validations.subProgram.$touch" required-field caption="Sous-programme" :options="subProgramOptions"
        :disable="disableSubProgram" />
      <ni-select v-if="isIntraCourse" in-modal v-model.trim="newCourse.company" :error="validations.company.$error"
        @blur="validations.company.$touch" required-field caption="Structure" :options="companyOptions" />
      <ni-input in-modal v-model.trim="newCourse.misc" caption="Informations Complémentaires" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la formation" color="primary" :loading="loading"
          icon-right="add" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import get from 'lodash/get';
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

        if (this.subProgramOptions.length === 1) this.newCourse.subProgram = this.subProgramOptions[0].value;
      } else {
        this.subProgramOptions = [];
        this.newCourse.subProgram = '';
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
    update () {
      this.$emit('update');
    },
  },
};
</script>
