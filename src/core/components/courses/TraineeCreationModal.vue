<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
        Ajouter un <span class="text-weight-bold">stagiaire</span> à la formation
      </template>
      <ni-input :disable="!firstStep" in-modal v-model.trim="newTrainee.local.email" required-field :last="firstStep"
        @blur="validations.local.email.$touch" caption="Email" :error-message="emailError(validations)"
        :error="validations.local.email.$error" />
      <template v-if="!firstStep">
        <ni-input in-modal v-if="!addNewTraineeCompanyStep" v-model="newTrainee.identity.firstname" caption="Prénom" />
        <ni-input in-modal v-if="!addNewTraineeCompanyStep" @blur="validations.identity.lastname.$touch" caption="Nom"
          required-field v-model="newTrainee.identity.lastname" :error="validations.identity.lastname.$error" />
        <ni-input in-modal v-if="!addNewTraineeCompanyStep" v-model.trim="newTrainee.contact.phone"
          caption="Téléphone" @blur="validations.contact.phone.$touch" :error="validations.contact.phone.$error"
          :error-message="phoneNbrError(validations)" :last="isIntraCourse" />
        <ni-select v-if="!isIntraCourse" in-modal v-model.trim="newTrainee.company" required-field caption="Structure"
          @blur="validations.company.$touch" :error="validations.company.$error" :options="companyOptions"
          :last="!isIntraCourse" />
      </template>
      <template slot="footer">
        <q-btn v-if="firstStep" no-caps class="full-width modal-btn" label="Suivant" color="primary"
          :loading="loading" icon-right="add" @click="nextStep" />
        <q-btn v-else no-caps class="full-width modal-btn" color="primary" label="Ajouter à la formation"
          :loading="loading" icon-right="add" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import { userMixin } from '@mixins/userMixin';

export default {
  name: 'TraineeCreationModal',
  mixins: [userMixin],
  props: {
    value: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: true },
    addNewTraineeCompanyStep: { type: Boolean, default: false },
    isIntraCourse: { type: Boolean, default: false },
    newTrainee: { type: Object, default: () => ({}) },
    companyOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
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
    nextStep () {
      this.$emit('next-step');
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
