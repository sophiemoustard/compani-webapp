<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
      Editer la <span class="text-weight-bold">souscription</span>
    </template>
    <ni-input in-modal v-model="editedSubscription.unitTTCRate" :error="validations.unitTTCRate.$error"
      caption="Prix unitaire TTC" @blur="validations.unitTTCRate.$touch" type="number" required-field />
    <ni-input in-modal v-model="editedSubscription.estimatedWeeklyVolume"
      :error="validations.estimatedWeeklyVolume.$error" caption="Volume hebdomadaire estimatif"
      @blur="validations.estimatedWeeklyVolume.$touch" type="number" required-field />
    <ni-input in-modal v-if="editedSubscription.nature !== FIXED" v-model="editedSubscription.sundays"
      caption="Dont dimanche (h)" type="number" />
    <ni-input in-modal v-if="editedSubscription.nature !== FIXED" v-model="editedSubscription.evenings"
      caption="Dont soirée (h)" last type="number" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Editer la souscription" icon-right="check" color="primary"
        :loading="loading" @click="updateSubscription" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { FIXED } from '@data/constants.js';

export default {
  name: 'SubscriptionCreationModal',
  props: {
    value: { type: Boolean, default: false },
    editedSubscription: { type: Object, default: () => ({}) },
    serviceOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  data () {
    return {
      FIXED,
    };
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    updateSubscription () {
      this.$emit('updateSubscription');
    },
  },
};
</script>
