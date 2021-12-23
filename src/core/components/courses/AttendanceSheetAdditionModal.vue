<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Ajouter une nouvelle <span class="text-weight-bold">feuille d'émargement</span>
    </template>
    <ni-select v-if="course.type === INTRA" :value="newAttendanceSheet.date" @blur="validations.date.$touch" in-modal
      :error="validations.date.$error" @input="update($event, 'date')" :options="dateOptions" caption="Date"
      required-field />
    <ni-select v-else :value="newAttendanceSheet.trainee" @blur="validations.trainee.$touch" :options="traineeOptions"
      :error="validations.trainee.$error" @input="update($event, 'trainee')" in-modal caption="Participant(e)"
      required-field />
    <ni-input in-modal caption="Feuille d'émargement" type="file" @blur="validations.file.$touch" last required-field
      :value="newAttendanceSheet.file" @input="update($event, 'file')" :error="validations.file.$error" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter la feuille d'émargement" color="primary"
        :loading="loading" icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import { INTRA } from '@data/constants';
import { formatAndSortIdentityOptions } from '@helpers/utils';
import { formatDate } from '@helpers/date';
import moment from '@helpers/moment';

export default {
  name: 'AttendanceSheetAdditionModal',
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
    'ni-input': Input,
  },
  props: {
    value: { type: Boolean, default: false },
    newAttendanceSheet: { type: Object, default: () => ({}) },
    course: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  data () {
    return {
      INTRA,
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
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:newAttendanceSheet', { ...this.newAttendanceSheet, [prop]: event });
    },
  },
};
</script>
