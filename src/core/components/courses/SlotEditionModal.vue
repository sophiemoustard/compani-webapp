<template>
  <ni-modal :value="value" @hide="hide" @input="input" container-class="modal-container-md">
    <template slot="title">
        Editer un <span class="text-weight-bold">créneau</span>
      </template>
      <div class="modal-icon">
        <ni-button icon="delete" @click="validateDeletion(editedCourseSlot._id)" />
      </div>
      <ni-select in-modal caption="Etape" :options="stepOptions" :value="editedCourseSlot.step" required-field
        @blur="validations.step.$touch" :error="validations.step.$error" @input="update($event, 'step')" />
      <ni-datetime-range caption="Dates et heures" :value="editedCourseSlot.dates" required-field disable-end-date
        :error="validations.dates.$error" @blur="validations.dates.$touch" @input="update($event, 'dates')" />
      <ni-search-address :value="editedCourseSlot.address" :error-message="addressError" in-modal last
        @blur="validations.address.$touch" :error="validations.address.$error" @input="update($event, 'address')" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Editer un créneau" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import Select from '@components/form/Select';
import DateTimeRange from '@components/form/DatetimeRange';
import SearchAddress from '@components/form/SearchAddress';
import { NotifyPositive } from '@components/popup/notify';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'SlotEditionModal',
  props: {
    value: { type: Boolean, default: false },
    editedCourseSlot: { type: Object, default: () => ({}) },
    stepOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-button': Button,
    'ni-datetime-range': DateTimeRange,
    'ni-search-address': SearchAddress,
    'ni-modal': Modal,
    'ni-select': Select,
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
        message: 'Es-tu sûr(e) de vouloir supprimer ce créneau ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.delete(slotId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    delete (slotId) {
      this.$emit('delete', slotId);
    },
    update (event, prop) {
      this.$emit('update:editedCourseSlot', { ...this.editedCourseSlot, [prop]: event });
    },
  },
};
</script>

<style lang="stylus" scoped>
  .modal-icon
    display: flex;
    justify-content: flex-end
</style>
