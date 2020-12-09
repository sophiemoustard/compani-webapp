<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
      Interventions <span class="text-weight-bold">simultanées</span>
    </template>
    <div class="q-mb-md">
      <ni-event-cell v-for="(event, eventIndex) in events" :key="eventIndex" :event="event" :person-key="CUSTOMER" />
    </div>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import EventCell from 'src/modules/client/components/planning/PlanningEvent';
import { CUSTOMER } from '@data/constants';

export default {
  name: 'ConflictModal',
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
    'ni-event-cell': EventCell,
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    submit () {
      this.$emit('submit');
    },
  },
};
</script>
