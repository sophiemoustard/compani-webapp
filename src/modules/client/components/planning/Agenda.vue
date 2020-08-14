<template>
  <div class="planning-container full-width full-height">
    <table class="agenda-table full-height">
      <thead>
        <th class="capitalize bottom-border" v-for="(day, index) in daysHeader" :key="index">
          <div class="row justify-center items-baseline days-header">
            <div class="days-name q-mr-lg">{{ day.name }}</div>
            <div data-cy="days-number" :class="['days-number', { 'current-day': isCurrentDay(day.moment) }]">
              {{ day.number }}
            </div>
            <div v-if="isHoliday(day.moment)" class="holiday">JF</div>
          </div>
        </th>
      </thead>
      <tbody>
        <tr>
          <td v-for="(day, dayIndex) in days" :key="`day_${dayIndex}`" valign="top" @click="createEvent(dayIndex)"
            data-cy="agenda-cell">
            <div class="planning-background">
              <template v-if="dayIndex === 0">
                <template v-for="(hour, hourIndex) in hours">
                  <div v-if="hourIndex !== 0" class="planning-hour" :key="`hour_${hourIndex}`"
                    :style="{ top: `${(hourIndex * halfHourHeight * 4) - 1.5}%` }">
                    {{ hour.format('HH:mm') }}
                  </div>
                </template>
              </template>
              <div v-for="(event, eventId) in getOneDayEvents(days[dayIndex])" :style="getEventStyle(event)"
                :key="eventId" @click.stop="editEvent(event)" class="event" :class="getEventClass(event)"
                data-cy="agenda-event">
                <div class="event-container" :style="{ top: event.staffingDuration < 90 ? '10%' : '6px' }">
                  <div class="col-12 event-title">
                    <p data-cy="event-title" v-if="event.type === INTERVENTION"
                      class="no-margin overflow-hidden-nowrap">
                      {{ eventTitle(event) }}
                    </p>
                    <p v-if="event.type === ABSENCE" class="no-margin overflow-hidden-nowrap">
                      {{ displayAbsenceType(event.absence) }}
                    </p>
                    <p v-if="event.type === UNAVAILABILITY" class="no-margin overflow-hidden-nowrap">
                      Indispo.
                    </p>
                    <p v-if="event.type === INTERNAL_HOUR" class="no-margin overflow-hidden-nowrap">
                      {{ event.internalHour.name }}
                    </p>
                  </div>
                  <p data-cy="event-hours" class="no-margin event-subtitle overflow-hidden-nowrap">
                    {{ getEventHours(event) }}
                  </p>
                  <p v-if="event.isBilled" class="no-margin event-subtitle event-billed">F</p>
                </div>
              </div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import {
  ABSENCE,
  INTERVENTION,
  INTERNAL_HOUR,
  UNAVAILABILITY,
  PLANNING_PERCENTAGE_BY_MINUTES,
  PLANNING_VIEW_START_HOUR,
  PLANNING_VIEW_END_HOUR,
} from '@data/constants';
import { planningEventMixin } from 'src/modules/client/mixins/planningEventMixin';

export default {
  name: 'Agenda',
  mixins: [planningEventMixin],
  props: {
    events: { type: Array, default: () => [] },
    days: { type: Array, default: () => [] },
    personKey: { type: String, default: '' },
  },
  data () {
    return {
      ABSENCE,
      INTERVENTION,
      INTERNAL_HOUR,
      UNAVAILABILITY,
      PLANNING_PERCENTAGE_BY_MINUTES,
      halfHourHeight: 100 / 30, // (100 => % total height - 30: number of half hours)
    };
  },
  mounted () {
    this.getTimelineHours();
  },
  methods: {
    getEventClass (event) {
      return [
        !this.isCustomerPlanning && 'cursor-pointer',
        event.isCancelled ? 'event-cancelled' : `event-${event.type}`,
      ];
    },
    getEventStyle (event) {
      return {
        top: `${PLANNING_PERCENTAGE_BY_MINUTES * event.staffingBeginning}%`,
        height: `${PLANNING_PERCENTAGE_BY_MINUTES * event.staffingDuration - 0.2}%`,
      };
    },
    getTimelineHours () {
      const range = this.$moment.range(
        this.$moment().hours(PLANNING_VIEW_START_HOUR).startOf('h'),
        this.$moment().hours(PLANNING_VIEW_END_HOUR).startOf('h')
      );
      this.hours = Array.from(range.by('hours', { step: 2 }));
    },
    getOneDayEvents (day) {
      return this.events
        .filter(event => this.$moment(day).isSameOrAfter(event.startDate, 'day') &&
            this.$moment(day).isSameOrBefore(event.endDate, 'day'))
        .map(event => this.getDisplayedEvent(event, day, PLANNING_VIEW_START_HOUR, PLANNING_VIEW_END_HOUR))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    createEvent (value) {
      this.$emit('createEvent', value);
    },
    editEvent (value) {
      this.$emit('editEvent', value);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .agenda-table
    th
      @media screen and (min-width: 768px)
        top: 85px;
      @media screen and (max-width: 767px)
        top: 100px;
    td
      padding: 0px;
      height: 100%;

      .planning-background
        background: repeating-linear-gradient(
          180deg,
          $white,
          $white 13.1%,
          $neutral-grey,
          $neutral-grey 13.3%
        )
        height: 100%;
        position: relative;
        margin-top: 2px;
        display: list-item;
        list-style: none;

      .event
        position: absolute;
        left: 3px;
        right: 3px;
        margin: 0;
        border: 1px solid $white;
        overflow: hidden;
        padding-top: 0;
        padding-bottom: 0;
        &-container
          height: auto;

      .planning-hour
        position: absolute;
        color: $middle-grey;
        background-color: $white;
        font-size: 12px;
        padding: 0 5px

thead
  vertical-align: baseline;

</style>
