<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
      Interventions <span class="text-weight-bold">simultanées</span>
    </template>
    <div class="q-mb-md">
      <planning-event v-for="(event, eventIndex) in events" :key="eventIndex" :event="event" :person-key="CUSTOMER"
        :in-modal="true" />
    </div>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import PlanningEvent from 'src/modules/client/components/planning/PlanningEvent';
import { CUSTOMER } from '@data/constants';

export default {
  name: 'EventConflictModal',
  props: {
    value: { type: Boolean, default: false },
    events: { type: Array, default: () => [] },
  },
  data () {
    return {
      CUSTOMER,
    };
  },
  components: {
    'ni-modal': Modal,
    'planning-event': PlanningEvent,
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
  },
};
</script>
