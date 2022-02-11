<template>
  <div v-if="displayStaffingView" :id="event._id" :draggable="canDrag(event)" @dragstart="drag(event, $event)"
    @click.stop="click(event)" :class="['row', 'cursor-pointer', 'event', `event-${event.type}`, 'q-mt-sm']"
    :style="getEventStyleForStaffing(event)">
    <div class="event-container">
      <div class="event-title">
        <p v-if="event.type === INTERVENTION" class="no-margin overflow-hidden-nowrap"
          :style="{ 'font-size': '0.5 rem' }">
          {{ eventTitleForStaffing(event) }}
        </p>
      </div>
    </div>
  </div>
  <div v-else :id="event._id" :draggable="canDrag(event)" @dragstart="drag(event, $event)" @click.stop="click(event)"
    :class="['row', inModal ? '': 'cursor-pointer', 'event',
    event.isCancelled ? 'event-cancelled' : `event-${event.type}`]">
    <div class="event-container">
      <div class="event-title">
        <p v-if="event.type === INTERVENTION" class="no-margin overflow-hidden-nowrap" data-cy="event-title">
          {{ eventTitle(event) }}
        </p>
        <p v-if="event.type === ABSENCE" class="no-margin overflow-hidden-nowrap">
          {{ displayAbsenceType(event.absence) }}
        </p>
        <p v-if="event.type === CUSTOMER_ABSENCE" class="no-margin overflow-hidden-nowrap">
          {{ displayCustomerAbsenceType(event.absenceType) }}
        </p>
        <p v-if="event.type === UNAVAILABILITY" class="no-margin overflow-hidden-nowrap">Indispo.</p>
        <p v-if="event.type === INTERNAL_HOUR" class="no-margin overflow-hidden-nowrap">
          {{ event.internalHour.name }}
        </p>
      </div>
      <div class="icon-container">
        <p class="no-margin event-subtitle overflow-hidden-nowrap" data-cy="event-start-hour">
          {{ getEventStartHour(event) }}
        </p>
        <q-icon name="check" />
      </div>
      <p class="no-margin event-subtitle overflow-hidden-nowrap" data-cy="event-end-hour">
        {{ getEventEndHour(event) }}
      </p>
      <p v-if="event.isBilled" class="no-margin event-subtitle event-billed">F</p>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import {
  INTERNAL_HOUR,
  INTERVENTION,
  ABSENCE,
  UNAVAILABILITY,
  AUXILIARY,
  STAFFING_PERCENTAGE_BY_MINUTES,
  CUSTOMER,
  CUSTOMER_ABSENCE,
} from '@data/constants';
import { planningEventMixin } from 'src/modules/client/mixins/planningEventMixin';

export default {
  name: 'PlanningEvent',
  mixins: [planningEventMixin],
  props: {
    displayStaffingView: { type: Boolean, default: false },
    event: { type: Object, default: () => ({}) },
    canDrag: { type: Function, default: () => {} },
    personKey: { type: String, default: AUXILIARY },
    inModal: { type: Boolean, default: false },
  },
  emits: ['drag', 'click'],
  data () {
    return {
      STAFFING_PERCENTAGE_BY_MINUTES,
      INTERNAL_HOUR,
      INTERVENTION,
      ABSENCE,
      UNAVAILABILITY,
      CUSTOMER_ABSENCE,
    };
  },
  computed: {
    rowId () {
      if (this.personKey === CUSTOMER) return this.event.customer._id;

      return this.event.auxiliary ? this.event.auxiliary._id : this.event.sector;
    },
  },
  methods: {
    getEventStyleForStaffing (event) {
      return {
        left: `${STAFFING_PERCENTAGE_BY_MINUTES * event.staffingBeginning}%`,
        width: `${STAFFING_PERCENTAGE_BY_MINUTES * event.staffingDuration}%`,
      };
    },
    drag (event, nativeEvent) {
      nativeEvent.dataTransfer.setData('text', ''); // Mandatory on Firefox
      this.$emit('drag', event);
    },
    click (event) {
      this.$emit('click', event);
    },
    eventTitleForStaffing (event) {
      const lastname = get(event, 'customer.identity.lastname', '');

      return lastname.trim().toUpperCase();
    },
  },
};
</script>

<style lang="sass" scoped>
.staffing
  .event
    position: absolute
    top: 2px
    bottom: 1px
    padding: 1px
    margin: 0
    border: 1px solid white
    font-size: 0.5rem
.icon-container
  display: flex
  flex-direction: row
  justify-content: left
</style>
