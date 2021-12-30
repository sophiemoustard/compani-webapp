<template>
    <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
      <template #title>
        Editer l'<span class="text-weight-bold">équipe</span>
      </template>
      <ni-input in-modal caption="Nom" :model-value="editedSector.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field @update:model-value="update($event.trim(), 'name')" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Editer l'équipe" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'SectorEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    editedSector: { type: Object, required: true },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
  },
  emits: ['update:model-value', 'hide', 'submit', 'update:edited-sector'],
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:edited-sector', { ...this.editedSector, [prop]: event });
    },
  },
};
</script>
