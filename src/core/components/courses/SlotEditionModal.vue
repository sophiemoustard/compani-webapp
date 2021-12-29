<template>
  <ni-modal :model-value="value" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
        Editer un <span class="text-weight-bold">créneau</span>
      </template>
      <div class="modal-icon">
        <ni-button icon="delete" @click="validateDeletion(editedCourseSlot._id)" />
      </div>
      <ni-select in-modal caption="Etape" :options="stepOptions" :model-value="editedCourseSlot.step" required-field
        @blur="validations.step.$touch" :error="validations.step.$error" @update:model-value="updateStep" />
      <ni-datetime-range caption="Dates et heures" :model-value="editedCourseSlot.dates" disable-end-date
        :error="validations.dates.$error" @blur="validations.dates.$touch" @update:model-value="update($event, 'dates')"
        required-field />
      <ni-search-address v-if="getType(this.editedCourseSlot.step) === ON_SITE" :model-value="editedCourseSlot.address"
        :error-message="addressError" in-modal last @blur="validations.address.$touch"
        :error="validations.address.$error" @update:model-value="update($event, 'address')" />
      <ni-input v-if="getType(this.editedCourseSlot.step) === REMOTE" :model-value="editedCourseSlot.meetingLink"
        @update:model-value="update($event, 'meetingLink')" caption="Lien vers la visio" in-modal
        :error-message="linkErrorMessage" :error="validations.meetingLink.$error" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Editer un créneau" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import DateTimeRange from '@components/form/DatetimeRange';
import SearchAddress from '@components/form/SearchAddress';
import { NotifyPositive } from '@components/popup/notify';
import { REQUIRED_LABEL, ON_SITE, REMOTE } from '@data/constants';

export default {
  name: 'SlotEditionModal',
  props: {
    value: { type: Boolean, default: false },
    editedCourseSlot: { type: Object, default: () => ({}) },
    stepOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    linkErrorMessage: { type: String, default: '' },
  },
  components: {
    'ni-button': Button,
    'ni-datetime-range': DateTimeRange,
    'ni-search-address': SearchAddress,
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
  },
  emits: ['hide', 'update:model-value', 'submit', 'delete', 'update'],
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
    validateDeletion (slotId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir supprimer ce créneau ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.delete(slotId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    delete (slotId) {
      this.$emit('delete', slotId);
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

<style lang="sass" scoped>
  .modal-icon
    display: flex
    justify-content: flex-end
</style>
