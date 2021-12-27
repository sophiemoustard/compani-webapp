<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Ajouter une <span class="text-weight-bold">souscription</span>
    </template>
    <ni-select in-modal caption="Service" :options="serviceOptions" :model-value="newSubscription.service"
      @blur="validations.service.$touch" @update:model-value="update($event, 'service')" required-field
      :error="validations.service.$error" />
    <ni-input in-modal :model-value="newSubscription.unitTTCRate" :error="validations.unitTTCRate.$error" required-field
      caption="Prix unitaire TTC" @blur="validations.unitTTCRate.$touch" type="number"
      @update:model-value="update($event, 'unitTTCRate')" />
    <ni-input in-modal :model-value="newSubscription.estimatedWeeklyVolume" type="number" required-field
      :error="validations.estimatedWeeklyVolume.$error" caption="Volume hebdomadaire estimatif"
      @blur="validations.estimatedWeeklyVolume.$touch" @update:model-value="update($event, 'estimatedWeeklyVolume')" />
    <ni-input in-modal v-if="newSubscription.service.nature !== FIXED" :model-value="newSubscription.sundays"
      caption="Dont dimanche (h)" type="number" @update:model-value="update($event, 'sundays')" />
    <ni-input in-modal v-if="newSubscription.service.nature !== FIXED" :model-value="newSubscription.evenings"
      caption="Dont soirée (h)" last type="number" @update:model-value="update($event, 'evenings')" />
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
    modelValue: { type: Boolean, default: false },
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
  emits: ['hide', 'update:model-value', 'submit', 'update:new-subscription'],
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
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:new-subscription', { ...this.newSubscription, [prop]: event });
    },
  },
};
</script>
