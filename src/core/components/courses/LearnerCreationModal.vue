<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
        Ajouter un <span class="text-weight-bold">apprenant</span>
      </template>
      <ni-input :disable="!firstStep" in-modal v-model.trim="newUser.local.email" required-field :last="firstStep"
        @blur="validations.local.email.$touch" caption="Email" :error-message="emailError(validations)"
        :error="validations.local.email.$error" />
      <template v-if="!firstStep">
        <ni-input in-modal v-if="!identityStep" v-model="newUser.identity.firstname" caption="Prénom" />
        <ni-input in-modal v-if="!identityStep" @blur="validations.identity.lastname.$touch" caption="Nom"
          required-field v-model="newUser.identity.lastname" :error="validations.identity.lastname.$error" />
        <ni-input in-modal v-if="!identityStep" v-model.trim="newUser.contact.phone"
          caption="Téléphone" @blur="validations.contact.phone.$touch" :error="validations.contact.phone.$error"
          :error-message="phoneNbrError(validations)" :last="companyStep" />
        <ni-select v-if="!companyStep" in-modal v-model.trim="newUser.company" required-field caption="Structure"
          @blur="validations.company.$touch" :error="validations.company.$error" :options="companyOptions"
          :last="!companyStep" />
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
  name: 'LearnerCreationModal',
  mixins: [userMixin],
  props: {
    value: { type: Boolean, default: false },
    firstStep: { type: Boolean, default: true },
    identityStep: { type: Boolean, default: false },
    companyStep: { type: Boolean, default: false },
    newUser: { type: Object, default: () => ({}) },
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
