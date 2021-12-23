<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
      Editer la <span class="text-weight-bold">souscription</span>
    </template>
    <ni-input in-modal :value="editedSubscription.unitTTCRate" :error="validations.unitTTCRate.$error"
      caption="Prix unitaire TTC" @blur="validations.unitTTCRate.$touch" type="number" required-field
      @input="update($event, 'unitTTCRate')" />
    <ni-input in-modal :value="editedSubscription.estimatedWeeklyVolume"
      :error="validations.estimatedWeeklyVolume.$error" caption="Volume hebdomadaire estimatif"
      @blur="validations.estimatedWeeklyVolume.$touch" type="number" required-field
      @input="update($event, 'estimatedWeeklyVolume')" />
    <ni-input in-modal v-if="editedSubscription.nature !== FIXED" :value="editedSubscription.sundays"
      caption="Dont dimanche (h)" type="number" @input="update($event, 'sundays')" />
    <ni-input in-modal v-if="editedSubscription.nature !== FIXED" :value="editedSubscription.evenings"
      caption="Dont soirée (h)" last type="number" @input="update($event, 'evenings')" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Editer la souscription" icon-right="check" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import { FIXED } from '@data/constants';

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
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:editedSubscription', { ...this.editedSubscription, [prop]: event });
    },
  },
};
</script>
