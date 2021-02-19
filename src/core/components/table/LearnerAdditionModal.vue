<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Ajouter un nouveau <span class="text-weight-bold">participant</span>
    </template>
    <ni-select :options="traineeFilterOptions" :value="selectedTrainee" @input="updateSelectedTrainee"
      caption="Participant" in-modal />
      <div class="row q-pb-md">
        Selectionner les créneaux auxquelles a été présent ce participant *
    <div v-for="slot in slots" :key="slot.value" class="col-md-6">
      <q-checkbox :value="checkboxValue(slot.value)" dense size="sm" :disable="loading" :label="slot.label"
        @input="upadteCheckBox(slot.value)" />
    </div>
      </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Ajouter le participant" color="primary"
        :loading="loading" icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import moment from '@helpers/moment';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import { attendanceTableMixin } from '@mixins/attendanceTableMixin';

export default {
  name: 'LearnerAdditionModal',
  props: {
    value: { type: Boolean, default: false },
    course: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    learners: { type: Array, default: () => [] },
    selectedTrainee: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
  },
  data () {
    return {
      attendances: [],
    };
  },
  mixins: [attendanceTableMixin],
  computed: {
    slots () {
      return this.course.slots.map(s => ({
        label: `${moment(s.startDate).format('DD/MM/YYYY')}
        ${moment(s.startDate).format('LT')} - ${moment(s.endDate).format('LT')}`,
        value: s._id,
      }));
    },
  },
  methods: {
    hide () {
      this.attendances = [];
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    updateSelectedTrainee (event) {
      this.$emit('update:selectedTrainee', event);
    },
    submit () {
      this.$emit('submit', { trainee: this.selectedTrainee, slots: this.attendances });
    },
    checkboxValue (slotId) {
      if (this.attendances.length) {
        return !!this.attendances.find(a => a === slotId);
      }
      return false;
    },
    upadteCheckBox (slotId) {
      if (this.checkboxValue(slotId)) {
        const slotIndex = this.attendances.indexOf(slotId);
        this.attendances.splice(slotIndex, 1);
      } else this.attendances.push(slotId);
    },
  },
};
</script>
