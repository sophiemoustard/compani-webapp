<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Ajouter une nouvelle <span class="text-weight-bold">feuille d'émargement</span>
    </template>
    <ni-select v-if="course.type !== INTRA" :value="newAttendanceSheet.trainee" @blur="validations.trainee.$touch"
      :error="validations.trainee.$error" :error-message="REQUIRED_LABEL" @input="update($event, 'trainee')" in-modal
      :options="traineesOption" />
    <ni-select v-if="course.type == INTRA" :value="newAttendanceSheet.date" @blur="validations.date.$touch"
      :error="validations.date.$error" :error-message="REQUIRED_LABEL" @input="update($event, 'date')" in-modal
      :options="dateOption" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Ajouter la feuille d'émargement" color="primary"
        :loading="loading" icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import { REQUIRED_LABEL, INTRA } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import moment from '@helpers/moment';

export default {
  name: 'AttendanceSheetAdditionModal',
  props: {
    value: { type: Boolean, default: false },
    newAttendanceSheet: { type: Object, default: () => ({}) },
    course: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  data () {
    return {
      REQUIRED_LABEL,
      INTRA,
    };
  },
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
  },
  computed: {
    traineesOption () {
      return this.course.trainees.map(trainee => ({
        label: formatIdentity(trainee.identity, 'FL'),
        value: trainee._id,
      }));
    },
    dateOption () {
      return this.course.slots.map(date => ({
        label: moment(date.startDate).format('DD MMMM YYYY'),
        value: date.startDate,
      }));
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
