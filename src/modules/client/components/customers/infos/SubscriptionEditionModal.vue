<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Editer la <span class="text-weight-bold">souscription</span>
    </template>
    <ni-input in-modal :model-value="editedSubscription.unitTTCRate" :error="validations.unitTTCRate.$error"
      caption="Prix unitaire TTC" @blur="validations.unitTTCRate.$touch" type="number" required-field
      @update:model-value="update($event, 'unitTTCRate')" />
    <template v-if="editedSubscription.nature === FIXED">
      <ni-input in-modal :model-value="editedSubscription.weeklyCount" :error="validations.weeklyCount.$error"
        caption="Volume hebdomadaire estimatif" @blur="validations.weeklyCount.$touch" type="number" required-field
        @update:model-value="update($event, 'weeklyCount')" />
    </template>
    <template v-else>
      <ni-input in-modal :model-value="editedSubscription.weeklyHours" :error="validations.weeklyHours.$error"
        caption="Volume hebdomadaire estimatif" @blur="validations.weeklyHours.$touch" type="number" required-field
        @update:model-value="update($event, 'weeklyHours')" />
      <ni-input in-modal :model-value="editedSubscription.sundays"
        caption="Dont dimanche (h)" type="number" @update:model-value="update($event, 'sundays')" />
      <ni-input in-modal :model-value="editedSubscription.evenings"
        caption="Dont soirée (h)" last type="number" @update:model-value="update($event, 'evenings')" />
    </template>
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
  name: 'SubscriptionEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    editedSubscription: { type: Object, default: () => ({}) },
    serviceOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-subscription'],
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
      this.$emit('update:edited-subscription', { ...this.editedSubscription, [prop]: event });
    },
  },
};
</script>
