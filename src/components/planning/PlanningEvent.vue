<template>
  <div v-if="displayStaffingView" :id="event._id" :draggable="canDrag(event)" @dragstart="drag(event, $event)"
    @click.stop="editEvent(event._id)" :class="['row', 'cursor-pointer', 'event', `event-${event.type}`, 'q-mt-sm']"
    :style="getEventStyleForStaffing(event)">
    <div class="event-container">
      <div class="event-title">
        <p v-if="event.type === INTERVENTION" class="no-margin overflow-hidden-nowrap"
          :style="{ 'font-size': '0.5 rem' }">
          {{ eventTitleForStaffing(event) }}</p>
      </div>
    </div>
  </div>
  <div v-else :id="event._id" :draggable="canDrag(event)" @dragstart="drag(event, $event)"
    :class="['row', 'cursor-pointer', 'event', event.isCancelled ? 'event-cancelled' : `event-${event.type}`]"
    @click.stop="editEvent(event._id)" >
    <div class="event-container">
      <div class="event-title">
        <p v-if="event.type === INTERVENTION" class="no-margin overflow-hidden-nowrap">
          {{ eventTitle(event) }}
        </p>
        <p v-if="event.type === ABSENCE" class="no-margin overflow-hidden-nowrap">
          {{ displayAbsenceType(event.absence) }}
        </p>
        <p v-if="event.type === UNAVAILABILITY" class="no-margin overflow-hidden-nowrap">Indispo.</p>
        <p v-if="event.type === INTERNAL_HOUR" class="no-margin overflow-hidden-nowrap">{{
          event.internalHour.name }}</p>
      </div>
      <p class="no-margin event-subtitle overflow-hidden-nowrap">{{ getEventHours(event) }}</p>
      <p v-if="event.isBilled" class="no-margin event-subtitle event-billed">F</p>
    </div>
  </div>
</template>

<script>
import { INTERNAL_HOUR, INTERVENTION, ABSENCE, UNAVAILABILITY, AUXILIARY, STAFFING_PERCENTAGE_BY_MINUTES, CUSTOMER } from '../../data/constants';
import { planningEventMixin } from '../../mixins/planningEventMixin';

export default {
  name: 'PlanningEvent',
  mixins: [planningEventMixin],
  props: {
    displayStaffingView: { type: Boolean, default: false },
    event: { type: Object, default: () => ({}) },
    canDrag: { type: Function, default: () => {} },
    personKey: { type: String, default: AUXILIARY },
  },
  data () {
    return {
      STAFFING_PERCENTAGE_BY_MINUTES,
      INTERNAL_HOUR,
      INTERVENTION,
      ABSENCE,
      UNAVAILABILITY,
    }
  },
  computed: {
    rowId () {
      if (this.personKey === CUSTOMER) return this.event.customer._id;

      return this.event.auxiliary ? this.event.auxiliary._id : this.event.sector
    },
  },
  methods: {
    getEventStyleForStaffing (event) {
      return {
        left: `${STAFFING_PERCENTAGE_BY_MINUTES * event.staffingLeft}%`,
        width: `${STAFFING_PERCENTAGE_BY_MINUTES * event.staffingWidth}%`,
      };
    },
    drag (event, nativeEvent) {
      nativeEvent.dataTransfer.setData('text', ''); // Mandatory on Firefox
      this.$emit('drag', event);
    },
    editEvent (eventId) {
      this.$emit('editEvent', { eventId, rowId: this.rowId });
    },
    eventTitleForStaffing (event) {
      const lastname = this.$_.get(event, 'customer.identity.lastname', '');

      return lastname.trim().toUpperCase();
    },
  },
}
</script>

<style lang="stylus" scoped>

.staffing
  .event
    position: absolute;
    top: 2px;
    bottom: 1px;
    padding: 1px;
    margin: 0;
    border: 1px solid white;
    font-size: 0.5rem;

</style>
