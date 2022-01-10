<template>
    <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
      <template #title>
        Créer une <span class="text-weight-bold">heure interne</span>
      </template>
      <ni-input in-modal caption="Nom" :model-value="newInternalHour.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field @update:model-value="update($event, 'name')" />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Créer l'heure interne" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'InternalHourCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    newInternalHour: { type: Object, required: true },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-internal-hour'],
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
      this.$emit('update:new-internal-hour', { ...this.newInternalHour, [prop]: event });
    },
  },
};
</script>
