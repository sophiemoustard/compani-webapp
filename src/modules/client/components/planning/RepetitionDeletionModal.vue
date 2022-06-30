<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="$emit('update:model-value')">
    <template #title>
      Supprimer une répétition de <span class="text-weight-bold">{{ currentAuxiliaryName }}</span>
    </template>
    <ni-repetition-cell :repetition="repetition" :visible="false" />
    <ni-date-input caption="À partir du" :model-value="repetition.dateDeletion" in-modal
      @update:model-value="updateDeletionDate($event)" required-field :min="minStartDate"
      :error="validations.dateDeletion.$error" />
    <span class="text q-mb-mds">
      Les évènements rattachés à cette répétition et postérieurs à cette date seront supprimés.
    </span>
    <div class="row justify-end q-my-md">
      <ni-button label="ANNULER" @click="cancel" />
      <ni-button label="OK" @click="confirmDeletion" />
    </div>
  </ni-modal>
</template>
<script>
import moment from '@helpers/moment';
import Button from '@components/Button';
import Modal from '@components/modal/Modal';
import RepetitionCell from 'src/modules/client/components/planning/RepetitionCell';
import DateInput from 'src/core/components/form/DateInput';

export default {
  name: 'RepetitionCell',
  components: {
    'ni-button': Button,
    'ni-modal': Modal,
    'ni-repetition-cell': RepetitionCell,
    'ni-date-input': DateInput,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    repetition: { type: Object, default: () => ({}) },
    currentAuxiliaryName: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
  },
  emits: ['hide', 'update:model-value', 'submit', 'cancel', 'update-deletion-date', 'confirm-deletion'],
  setup (props, { emit }) {
    const minStartDate = moment().startOf('d').toISOString();

    const hide = () => emit('hide');

    const cancel = () => emit('cancel');

    const updateDeletionDate = event => emit('update-deletion-date', event);

    const confirmDeletion = () => emit('confirm-deletion');

    return {
      // Data
      minStartDate,
      // Methods
      hide,
      cancel,
      updateDeletionDate,
      confirmDeletion,
    };
  },
};
</script>
<style lang="sass" scoped>
.text
  color: $copper-grey-600
  font-size: 12px
</style>
