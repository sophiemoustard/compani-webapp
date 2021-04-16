<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Créer un nouveau <span class="text-weight-bold">partenaire</span>
    </template>
    <ni-input in-modal :value="newPartner.identity.lastname" @input="update($event.trim(), 'identity.lastname')"
      caption="Nom" required-field />
    <ni-input in-modal :value="newPartner.identity.firstname" @input="update($event.trim(), 'identity.firstname')"
      caption="Prénom" required-field />
    <ni-input in-modal :value="newPartner.email" @input="update($event.trim(), 'email')" caption="Email" />
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

export default {
  name: 'PartnerCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newPartner: { type: Object, default: () => ({}) },
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
