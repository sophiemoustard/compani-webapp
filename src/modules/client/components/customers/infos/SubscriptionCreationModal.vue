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
      @update:model-value="update($event, 'unitTTCRate')" :error-message="unitTtcRateErrorMessage" />
    <template v-if="serviceNature === FIXED">
      <ni-input in-modal :model-value="newSubscription.weeklyCount" type="number" required-field
        :error="validations.weeklyCount.$error" caption="Nombre d'interventions hebdomadaire estimatif"
        @blur="validations.weeklyCount.$touch" @update:model-value="update($event, 'weeklyCount')"
        :error-message="weeklyCountErrorMessage" />
    </template>
    <template v-else>
      <ni-input in-modal :model-value="newSubscription.weeklyHours" type="number" required-field
        :error="validations.weeklyHours.$error" caption="Volume horaire hebdomadaire estimatif"
        @blur="validations.weeklyHours.$touch" @update:model-value="update($event, 'weeklyHours')"
        :error-message="weeklyHoursErrorMessage" />
      <ni-input in-modal :model-value="newSubscription.sundays" caption="Dont dimanche (h)" type="number"
        @update:model-value="update($event, 'sundays')" :error-message="sundaysErrorMessage"
        :error="validations.sundays.$error" @blur="validations.sundays.$touch" />
      <ni-input in-modal :model-value="newSubscription.evenings" caption="Dont soirée (h)" last type="number"
        @update:model-value="update($event, 'evenings')" :error-message="eveningsErrorMessage"
        :error="validations.evenings.$error" @blur="validations.evenings.$touch" />
    </template>
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Ajouter une souscription" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import get from 'lodash/get';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { FIXED, REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'SubscriptionCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newSubscription: { type: Object, default: () => ({}) },
    serviceOptions: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    unitTtcRateErrorMessage: { type: String, default: 'poiuy' },
    weeklyHoursErrorMessage: { type: String, default: REQUIRED_LABEL },
    weeklyCountErrorMessage: { type: String, default: REQUIRED_LABEL },
    eveningsErrorMessage: { type: String, default: REQUIRED_LABEL },
    sundaysErrorMessage: { type: String, default: REQUIRED_LABEL },
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
  computed: {
    serviceNature () {
      const service = this.serviceOptions.find(s => s.value === this.newSubscription.service);
      return get(service, 'nature') || '';
    },
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
