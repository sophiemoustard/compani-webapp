<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="$emit('update:model-value')">
    <template #title>
      Êtes-vous sûr(e) de vouloir supprimer cette répétition&nbsp;?
    </template>
    <ni-repetition-cell :repetition="repetition" :visible="false" :person-type="personType" />
    <div class="text">
      Les événements rattachés à cette répétition et postérieurs au {{ formatDate }} seront supprimés.
    </div>
    <div class="row justify-end q-my-md">
      <ni-button label="ANNULER" @click="cancel" />
      <ni-button label="OK" @click="submit" :loading="loading" />
    </div>
  </ni-modal>
</template>
<script>
import { computed } from 'vue';
import moment from '@helpers/moment';
import Modal from '@components/modal/Modal';
import Button from '@components/Button';
import RepetitionCell from 'src/modules/client/components/planning/RepetitionCell';

export default {
  name: 'RepetitionDeletionConfirmationModal',
  components: {
    'ni-button': Button,
    'ni-modal': Modal,
    'ni-repetition-cell': RepetitionCell,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    repetition: { type: Object, default: () => ({}) },
    personType: { type: String, default: '' },
  },
  emits: ['hide', 'update:model-value', 'cancel', 'submit'],
  setup (props, { emit }) {
    const hide = () => emit('hide');

    const cancel = () => emit('cancel');

    const submit = () => emit('submit');

    const formatDate = computed(() => moment(props.repetition.dateDeletion).format('DD/MM/YYYY'));

    return {
      // Computed
      formatDate,
      // Methods
      hide,
      cancel,
      submit,
    };
  },
};
</script>
<style lang="sass" scoped>
.text
  color: black
  font-size: 16px
</style>
