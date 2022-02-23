<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Editer la <span class="text-weight-bold">souscription</span>
    </template>
    <ni-input in-modal :model-value="editedSubscription.unitTTCRate" :error="validations.unitTTCRate.$error"
      caption="Prix unitaire TTC" @blur="validations.unitTTCRate.$touch" type="number" required-field
      @update:model-value="update($event, 'unitTTCRate')" :error-message="unitTtcRateErrorMessage" />
    <template v-if="editedSubscription.nature === FIXED">
      <ni-input in-modal :model-value="editedSubscription.weeklyCount" :error="validations.weeklyCount.$error"
        caption="Nombre d'interventions hebdomadaire estimatif" @blur="validations.weeklyCount.$touch" type="number"
        @update:model-value="update($event, 'weeklyCount')" required-field :error-message="weeklyCountErrorMessage" />
    </template>
    <template v-else>
      <ni-input in-modal :model-value="editedSubscription.weeklyHours" :error="validations.weeklyHours.$error"
        caption="Volume horaire hebdomadaire estimatif" @blur="validations.weeklyHours.$touch" type="number"
        required-field @update:model-value="update($event, 'weeklyHours')" :error-message="weeklyHoursErrorMessage" />
      <ni-input in-modal :model-value="editedSubscription.sundays" :error-message="sundaysErrorMessage"
        caption="Dont dimanche (h)" type="number" @update:model-value="update($event, 'sundays')"
        :error="validations.sundays.$error" @blur="validations.sundays.$touch" />
      <ni-input in-modal :model-value="editedSubscription.evenings" :error-message="eveningsErrorMessage"
        caption="Dont soirée (h)" last type="number" @update:model-value="update($event, 'evenings')"
        :error="validations.evenings.$error" @blur="validations.evenings.$touch" />
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
import { FIXED, REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'SubscriptionEditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    editedSubscription: { type: Object, default: () => ({}) },
    serviceOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    unitTtcRateErrorMessage: { type: String, default: REQUIRED_LABEL },
    weeklyHoursErrorMessage: { type: String, default: REQUIRED_LABEL },
    weeklyCountErrorMessage: { type: String, default: REQUIRED_LABEL },
    eveningsErrorMessage: { type: String, default: REQUIRED_LABEL },
    sundaysErrorMessage: { type: String, default: REQUIRED_LABEL },
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
