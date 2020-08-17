<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">formation</span>
      </template>
      <ni-option-group v-model="newCourse.type" type="radio" :options="courseTypes" :error="validations.type.$error"
        caption="Type" required-field inline @input="update" />
      <ni-select in-modal v-model.trim="newCourse.program" :error="validations.program.$error"
        @blur="validations.program.$touch" required-field caption="Programme" :options="programOptions" />
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
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import Input from '@components/form/Input';
import { COURSE_TYPES } from '@data/constants';

export default {
  name: 'CourseCreationModal',
  props: {
    value: { type: Boolean, default: false },
    isIntraCourse: { type: Boolean, default: false },
    newCourse: { type: Object, default: () => ({}) },
    programOptions: { type: Array, default: () => [] },
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
    };
  },
  methods: {
    hide () {
      this.$emit('hide');
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
