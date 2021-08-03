<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-select :options="traineeFilterOptions" :value="newTraineeAttendance.trainee"
      @input="update($event, 'trainee')" caption="Participant(e)" in-modal
      :error="validation.trainee.$error" :error-message="REQUIRED_LABEL" required-field />
    <div class="row q-pb-md">
      <ni-option-group :value="newTraineeAttendance.attendances" @input="update($event, 'attendances')"
        :options="slotsOptions" :error="validation.attendances.$error" :error-message="REQUIRED_LABEL" required-field
        type="checkbox" caption="Selectionner les créneaux auxquelles a été présent(e) le/la participant(e)" inline />
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Ajouter la personne" color="primary"
        :loading="loading" icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import moment from '@helpers/moment';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import OptionGroup from '@components/form/OptionGroup';
import { REQUIRED_LABEL } from '@data/constants';
import { formatDate } from '@helpers/date';

export default {
  name: 'TraineeAttendanceCreationModal',
  props: {
    value: { type: Boolean, default: false },
    course: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    trainees: { type: Array, default: () => [] },
    traineeFilterOptions: { type: Array, default: () => [] },
    newTraineeAttendance: { type: Object, default: () => ({}) },
    validation: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-select': Select,
    'ni-option-group': OptionGroup,
    'ni-modal': Modal,
  },
  data () {
    return {
      REQUIRED_LABEL,
    };
  },
  computed: {
    slotsOptions () {
      return this.course.slots.map(s => ({
        label: `${formatDate(s.startDate)} ${moment(s.startDate).format('LT')} - ${moment(s.endDate).format('LT')}`,
        value: s._id,
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
    update (event, path) {
      this.$emit('update:newTraineeAttendance', set({ ...this.newTraineeAttendance }, path, event));
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
