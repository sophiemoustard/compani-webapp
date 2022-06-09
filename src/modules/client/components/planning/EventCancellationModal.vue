<template>
  <q-dialog :model-value="modelValue" @hide="hide" @update:model-value="$emit('update:model-value')">
    <div class="modal-container-md modal-padding">
      <div class="title q-mb-md">Annuler l'intervention</div>
      <div class="row justify-end q-mb-md">
        <ni-button label="RETOUR" @click="hide" />
        <ni-button label="ANNULER L'INTERVENTION" @click="() => {}" />
      </div>
    </div>
  </q-dialog>
</template>

<script>
import Button from '@components/Button';
import Input from '@components/form/Input';

export default {
  name: 'EventCancellationModal',
  components: {
    'ni-button': Button,
    'ni-input': Input,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    editedEvent: { type: Object, default: () => ({}) },
  },
  emits: ['hide', 'update:model-value'],
  setup (props, { emit }) {
    const hide = () => { emit('hide'); };

    return { hide };
  },
};
</script>

<style lang="sass" scoped>
.title
  font-size: 20px
</style>
