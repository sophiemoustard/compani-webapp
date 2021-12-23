<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Créer une nouvelle <span class="text-weight-bold">activité</span>
    </template>
    <ni-input in-modal :value="newActivity.name" :error="validations.name.$error" @input="update($event.trim(), 'name')"
      @blur="validations.name.$touch" required-field caption="Nom" />
    <ni-select in-modal caption="Type" :options="ACTIVITY_TYPES" :value="newActivity.type" required-field
      :error="validations.type.$error" @input="update($event, 'type')" />
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
    value: { type: Boolean, default: false },
    newActivity: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
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
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:newActivity', { ...this.newActivity, [prop]: event });
    },
  },
};
</script>
