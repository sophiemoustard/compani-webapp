<template>
  <ni-modal :value="value" @hide="hide" @input="input" container-class="modal-container-md">
    <template slot="title">
        Ajouter un <span class="text-weight-bold">créneau</span>
      </template>
      <ni-select in-modal caption="Etape" :options="stepOptions" :value="newCourseSlot.step" required-field
        @blur="validations.step.$touch" :error="validations.step.$error" @input="updateStep" />
      <ni-datetime-range caption="Dates et heures" :value="newCourseSlot.dates" required-field disable-end-date
        :error="validations.dates.$error" @blur="validations.dates.$touch" @input="update($event, 'dates')" />
      <ni-search-address v-if="getType(this.newCourseSlot.step) === ON_SITE"
        :value="newCourseSlot.address" @input="update($event, 'address')" :error-message="addressError"
        @blur="validations.address.$touch" :error="validations.address.$error" in-modal last />
      <ni-input v-if="getType(this.newCourseSlot.step) === REMOTE" in-modal :error="validations.meetingLink.$error"
        :value="newCourseSlot.meetingLink" @input="update($event, 'meetingLink')" caption="Lien vers la visio"
        :error-message="linkErrorMessage" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter un créneau" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import DateTimeRange from '@components/form/DatetimeRange';
import SearchAddress from '@components/form/SearchAddress';
import { REQUIRED_LABEL, ON_SITE, REMOTE } from '@data/constants';

export default {
  name: 'SlotCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newCourseSlot: { type: Object, default: () => ({}) },
    stepOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    linkErrorMessage: { type: String, default: '' },
  },
  components: {
    'ni-datetime-range': DateTimeRange,
    'ni-search-address': SearchAddress,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
  },
  data () {
    return {
      ON_SITE,
      REMOTE,
    };
  },
  computed: {
    addressError () {
      if (!this.validations.address.fullAddress.required) return REQUIRED_LABEL;
      return 'Adresse non valide';
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
    update (value, path) {
      this.$emit('update', { path, value });
    },
    getType (step) {
      return step ? this.stepOptions.find(option => option.value === step).type : '';
    },
    updateStep (step) {
      const type = this.getType(step);
      if (type !== REMOTE) this.update('', 'meetingLink');
      if (type !== ON_SITE) this.update({}, 'address');
      this.update(step, 'step');
    },
  },
};
</script>
