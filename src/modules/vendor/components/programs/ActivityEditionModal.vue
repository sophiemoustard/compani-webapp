<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
        Éditer une <span class="text-weight-bold">activité</span>
      </template>
      <ni-input in-modal :value="editedActivity.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field caption="Nom" @input="update($event.trim(), 'name')" />
      <ni-select caption="Type" :options="typeOptions" :value="editedActivity.type" required-field in-modal last
        :error="validations.type.$error" @input="update($event, 'type')" :disable="isPublished" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Éditer l'activité" color="primary" :loading="loading"
          icon-right="add" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { PUBLISHED } from '@data/constants';

export default {
  name: 'ActivityEditionModal',
  props: {
    value: { type: Boolean, default: false },
    editedActivity: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    typeOptions: { type: Array, default: () => [] },
  },
  computed: {
    isPublished () {
      return this.editedActivity.status === PUBLISHED;
    },
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
      this.$emit('update:editedActivity', { ...this.editedActivity, [prop]: event });
    },
  },
};
</script>
