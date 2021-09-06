<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
        Ajouter une <span class="text-weight-bold">personne</span>
      </template>
      <ni-select in-modal :value="newTrainee" @input="update" caption="Stagiaire" :error="validations.$error"
        :options="traineesOptions" required-field />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Ajouter la personne" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import { userMixin } from '@mixins/userMixin';

export default {
  name: 'TraineeAdditionModal',
  mixins: [userMixin],
  props: {
    value: { type: Boolean, default: false },
    traineesOptions: { type: Array, default: () => [] },
    newTrainee: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
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
    update (event) {
      this.$emit('update:newTrainee', event);
    },
  },
};
</script>
