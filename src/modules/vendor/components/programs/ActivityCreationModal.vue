<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer une nouvelle <span class="text-weight-bold">activité</span>
    </template>
    <ni-input in-modal :model-value="newActivity.name" :error="validations.name.$error" caption="Nom"
      @update:model-value="update($event.trim(), 'name')" @blur="validations.name.$touch" required-field />
    <ni-select in-modal caption="Type" :options="ACTIVITY_TYPES" :model-value="newActivity.type" required-field
      :error="validations.type.$error" @update:model-value="update($event, 'type')" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer l'activité" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { ACTIVITY_TYPES } from '@data/constants';

export default {
  name: 'ActivityCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newActivity: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-activity'],
  data () {
    return {
      ACTIVITY_TYPES,
    };
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
  },
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
      this.$emit('update:new-activity', { ...this.newActivity, [prop]: event });
    },
  },
};
</script>
