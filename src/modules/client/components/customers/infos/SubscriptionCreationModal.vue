<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Ajouter une <span class="text-weight-bold">souscription</span>
    </template>
    <ni-select in-modal caption="Service" :options="serviceOptions" v-model="newSubscription.service" required-field
      :error="validations.service.$error" @blur="validations.service.$touch" />
    <ni-input in-modal v-model="newSubscription.unitTTCRate" :error="validations.unitTTCRate.$error"
      caption="Prix unitaire TTC" @blur="validations.unitTTCRate.$touch" type="number" required-field />
    <ni-input in-modal v-model="newSubscription.estimatedWeeklyVolume"
      :error="validations.estimatedWeeklyVolume.$error" caption="Volume hebdomadaire estimatif"
      @blur="validations.estimatedWeeklyVolume.$touch" type="number" required-field />
    <ni-input in-modal v-if="newSubscription.service.nature !== FIXED" v-model="newSubscription.sundays"
      caption="Dont dimanche (h)" type="number" />
    <ni-input in-modal v-if="newSubscription.service.nature !== FIXED" v-model="newSubscription.evenings"
      caption="Dont soirée (h)" last type="number" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Ajouter une souscription" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { FIXED } from '@data/constants';

export default {
  name: 'SubscriptionCreationModal',
  props: {
    value: { type: Boolean, default: false },
    newSubscription: { type: Object, default: () => ({}) },
    serviceOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
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
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
