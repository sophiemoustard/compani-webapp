<template>
    <ni-modal :value="value" @hide="hide" @input="input">
      <template slot="title">
        Ajouter une <span class="text-weight-bold">équipe</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newSector.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field />
      <template slot="footer">
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
    value: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    newSector: { type: Object, required: true },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
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
  },
};
</script>
