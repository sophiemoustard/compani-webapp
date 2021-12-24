<template>
    <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
      <template #title>
        Ajouter une <span class="text-weight-bold">équipe</span>
      </template>
      <ni-input in-modal caption="Nom" :model-value="newSector.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field @update:model-value="update($event.trim(), 'name')" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Ajouter une équipe" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'SectorCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    newSector: { type: Object, required: true },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:newSector'],
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
      this.$emit('update:newSector', { ...this.newSector, [prop]: event });
    },
  },
};
</script>
