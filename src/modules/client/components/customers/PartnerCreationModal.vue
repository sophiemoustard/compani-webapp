<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Créer un nouveau <span class="text-weight-bold">partenaire</span>
    </template>
    <ni-input in-modal :value="newPartner.identity.lastname" @input="update($event.trim(), 'identity.lastname')"
      @blur="validations.identity.lastname.$touch" :error="validations.identity.lastname.$error" caption="Nom"
      required-field />
    <ni-input in-modal :value="newPartner.identity.firstname" @input="update($event.trim(), 'identity.firstname')"
      @blur="validations.identity.firstname.$touch" :error="validations.identity.firstname.$error" caption="Prénom"
      required-field />
    <ni-input in-modal :value="newPartner.email" @input="update($event.trim(), 'email')" caption="Email"
      @blur="validations.email.$touch" :error="validations.email.$error" :error-message="emailError(validations)" />
    <ni-select in-modal :value="newPartner.job" @input="update($event, 'job')" caption="Fonction"
      :options="jobOptions" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer le partenaire" icon-right="add" color="primary"
        @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { JOB_OPTIONS } from '@data/constants';
import { partnerOrganizationMixin } from '@mixins/partnerOrganizationMixin';

export default {
  name: 'PartnerCreationModal',
  mixins: [partnerOrganizationMixin],
  props: {
    value: { type: Boolean, default: false },
    newPartner: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-select': Select,
  },
  data () {
    return {
      jobOptions: JOB_OPTIONS,
    };
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
    update (event, path) {
      this.$emit('update:newPartner', set({ ...this.newPartner }, path, event));
    },
  },
};
</script>
