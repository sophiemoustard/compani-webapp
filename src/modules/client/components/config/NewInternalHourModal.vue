<template>
    <ni-modal :value="value" @hide="hide">
      <template slot="title">
        Créer une <span class="text-weight-bold">heure interne</span>
      </template>
      <ni-input in-modal caption="Nom" v-model="newInternalHour.name" :error="validations.name.$error"
        @blur="validations.name.$touch" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer l'heure interne" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';

export default {
  name: 'NewInternalHourModal',
  props: {
    value: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    newInternalHour: { type: Object, required: true },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
