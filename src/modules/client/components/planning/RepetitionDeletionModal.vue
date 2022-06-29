<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="$emit('update:model-value')">
    <template #title>
      Supprimer une répétition de <span class="text-weight-bold">{{ currentAuxiliaryName }}</span>
    </template>
    <ni-repetition-cell :repetition="repetition" :visible="false" />
    <ni-date-input caption="À partir du" :model-value="startDateDeletion" in-modal
      @update:model-value="update($event, 'startDateDeletion')" required-field :min="minStartDate" />
    <span class="text">
      Les évènements rattachés à cette répétition et postérieurs à cette date seront supprimés.
    </span>
    <div class="row justify-end q-mb-md">
      <ni-button label="ANNULER" @click="() => {}" />
      <ni-button label="OK" @click="() => {}" />
    </div>
  </ni-modal>
</template>
<script>
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
  },
  emits: ['hide', 'update:model-value', 'submit'],
  setup (props, { emit }) {
    const minStartDate = new Date();
    const hide = () => emit('hide');

    return {
      // Data
      minStartDate,
      // Methods
      hide,
    };
  },
};
</script>
<style lang="sass" scoped>
.text
  color: $copper-grey-600
  font-size: 12px
</style>
