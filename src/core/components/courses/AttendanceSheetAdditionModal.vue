<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une nouvelle <span class="text-weight-bold">feuille d'émargement</span>
    </template>
    <ni-select v-if="course.type === INTRA" :model-value="newAttendanceSheet.date" @blur="validations.date.$touch"
      :error="validations.date.$error" @update:model-value="update($event, 'date')" :options="dateOptions"
      required-field in-modal caption="Date" />
    <ni-select v-else :model-value="newAttendanceSheet.trainee" @blur="validations.trainee.$touch"
      :error="validations.trainee.$error" @update:model-value="update($event, 'trainee')" in-modal required-field
      caption="Participant(e)" :options="traineeOptions" />
    <ni-input in-modal caption="Feuille d'émargement" type="file" @blur="validations.file.$touch" last required-field
      :model-value="newAttendanceSheet.file" @update:model-value="update($event, 'file')"
      :extensions="[DOC_EXTENSIONS, IMAGE_EXTENSIONS]" :error="validations.file.$error" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Ajouter la feuille d'émargement" :loading="loading"
        icon-right="add" @click="submit" color="white" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import Button from '@components/Button';
import { INTRA, DOC_EXTENSIONS, IMAGE_EXTENSIONS } from '@data/constants';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import moment from '@helpers/moment';

export default {
  name: 'AttendanceSheetAdditionModal',
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    newAttendanceSheet: { type: Object, default: () => ({}) },
    course: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  emits: ['hide', 'update:model-value', 'update:new-attendance-sheet', 'submit'],
  data () {
    return {
      INTRA,
      DOC_EXTENSIONS,
      IMAGE_EXTENSIONS,
    };
  },
  computed: {
    traineeOptions () {
      return formatAndSortIdentityOptions(this.course.trainees);
    },
    dateOptions () {
      const dateOptionsSet = new Set(this.course.slots.map(date => moment(date.startDate).startOf('d').toISOString()));

      return [...dateOptionsSet].map(date => ({ value: new Date(date), label: formatDate(date) }));
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
    update (event, prop) {
      this.$emit('update:new-attendance-sheet', { ...this.newAttendanceSheet, [prop]: event });
    },
  },
};
</script>
