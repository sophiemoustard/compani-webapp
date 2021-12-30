<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une <span class="text-weight-bold">personne</span>
    </template>
    <ni-select :options="traineeFilterOptions" :model-value="newTraineeAttendance.trainee"
      @update:model-value="update($event, 'trainee')" caption="Participant(e)" in-modal
      :error="validation.trainee.$error" :error-message="REQUIRED_LABEL" required-field />
    <div class="row q-pb-md">
      <ni-option-group :model-value="newTraineeAttendance.attendances" :error-message="REQUIRED_LABEL" required-field
        :options="slotsOptions" :error="validation.attendances.$error" type="checkbox" inline
        caption="Selectionner les créneaux auxquels a été présent(e) le/la participant(e)"
        @update:model-value="update($event, 'attendances')" />
    </div>
    <template #footer>
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
    modelValue: { type: Boolean, default: false },
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
  emits: ['hide', 'update:model-value', 'update:new-trainee-attendance', 'submit'],
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
      this.$emit('update:model-value', event);
    },
    update (event, path) {
      this.$emit('update:new-trainee-attendance', set({ ...this.newTraineeAttendance }, path, event));
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
