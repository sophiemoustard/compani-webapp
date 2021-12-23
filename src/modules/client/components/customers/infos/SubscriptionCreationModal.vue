<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Ajouter une <span class="text-weight-bold">souscription</span>
    </template>
    <ni-select in-modal caption="Service" :options="serviceOptions" :value="newSubscription.service" required-field
      :error="validations.service.$error" @blur="validations.service.$touch" @input="update($event, 'service')" />
    <ni-input in-modal :value="newSubscription.unitTTCRate" :error="validations.unitTTCRate.$error"
      caption="Prix unitaire TTC" @blur="validations.unitTTCRate.$touch" type="number" required-field
      @input="update($event, 'unitTTCRate')" />
    <ni-input in-modal :value="newSubscription.estimatedWeeklyVolume" @input="update($event, 'estimatedWeeklyVolume')"
      :error="validations.estimatedWeeklyVolume.$error" caption="Volume hebdomadaire estimatif"
      @blur="validations.estimatedWeeklyVolume.$touch" type="number" required-field />
    <ni-input in-modal v-if="newSubscription.service.nature !== FIXED" :value="newSubscription.sundays"
      caption="Dont dimanche (h)" type="number" @input="update($event, 'sundays')" />
    <ni-input in-modal v-if="newSubscription.service.nature !== FIXED" :value="newSubscription.evenings"
      caption="Dont soirée (h)" last type="number" @input="update($event, 'evenings')" />
    <template #footer>
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
    update (event, prop) {
      this.$emit('update:newSubscription', { ...this.newSubscription, [prop]: event });
    },
  },
};
</script>
