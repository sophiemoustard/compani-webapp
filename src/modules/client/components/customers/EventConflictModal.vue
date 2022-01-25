<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="$emit('update:model-value')">
    <template #title>
      Interventions <span class="text-weight-bold">simultanées</span>
    </template>
    <div class="q-mb-md">
      <planning-event-cell v-for="(event, eventIndex) in events" :key="eventIndex" :event="event" :person-key="CUSTOMER"
        in-modal />
    </div>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import PlanningEventCell from 'src/modules/client/components/planning/PlanningEventCell';
import { CUSTOMER } from '@data/constants';

export default {
  name: 'EventConflictModal',
  props: {
    modelValue: { type: Boolean, default: false },
    events: { type: Array, default: () => [] },
  },
  emits: ['hide', 'update:model-value'],
  data () {
    return {
      CUSTOMER,
    };
  },
  components: {
    'ni-modal': Modal,
    'planning-event-cell': PlanningEventCell,
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
  },
};
</script>
