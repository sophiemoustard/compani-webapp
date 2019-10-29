<template>
  <div class="planning-container full-width full-height">
    <table style="width: 100%" class="agenda-table full-height">
      <thead style="height: 5%">
        <th class="capitalize bottom-border" v-for="(day, index) in daysHeader" :key="index">
          <div class="row justify-center items-baseline days-header">
            <div class="days-name q-mr-md">{{ day.name }}</div>
            <div :class="['days-number', { 'current-day': isCurrentDay(day.moment) }]">{{ day.number }}</div>
          </div>
        </th>
      </thead>
      <tbody>
        <tr>
          <td v-for="(day, dayIndex) in days" :key="`day_${dayIndex}`" valign="top" @click="createEvent(dayIndex)">
            <div class="planning-background">
              <template v-if="dayIndex === 0">
                <template v-for="(hour, hourIndex) in hours">
                  <div v-if="hourIndex !== 0" class="planning-hour" :key="`hour_${hourIndex}`"
                    :style="{ top: `${(hourIndex * halfHourHeight * 4) - 1.5}%` }">{{ hour.format('HH:mm') }}</div>
                </template>
              </template>
              <template v-for="(event, eventId) in getOneDayEvents(days[dayIndex])">
                <div :style="getEventStyle(event)" :key="eventId" @click.stop="editEvent(event)"
                :class="[!isCustomerPlanning && 'cursor-pointer', 'event', event.isCancelled ? 'event-cancelled' : `event-${event.type}`]">
                  <div class="event-container" :style="{ top: event.staffingHeight < 90 ? '10%' : '6px' }">
                    <div class="col-12 event-title">
                      <p v-if="event.type === INTERVENTION" class="no-margin overflow-hidden-nowrap">
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
                    <p class="no-margin event-subtitle overflow-hidden-nowrap">{{ getEventHours(event) }}</p>
                    <p v-if="event.isBilled" class="no-margin event-subtitle event-billed">F</p>
                  </div>
                </div>
              </template>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { planningEventMixin } from '../../mixins/planningEventMixin';
import {
  ABSENCE,
  INTERVENTION,
  INTERNAL_HOUR,
  UNAVAILABILITY,
  PLANNING_PERCENTAGE_BY_MINUTES,
  PLANNING_VIEW_START_HOUR,
  PLANNING_VIEW_END_HOUR,
} from '../../data/constants';

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
    getEventStyle (event) {
      return {
        top: `${PLANNING_PERCENTAGE_BY_MINUTES * event.staffingTop}%`,
        height: `${PLANNING_PERCENTAGE_BY_MINUTES * event.staffingHeight - 0.2}%`,
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
        .filter(event =>
          this.$moment(day).isSameOrAfter(event.startDate, 'day') && this.$moment(day).isSameOrBefore(event.endDate, 'day')
        )
        .map((event) => {
          let dayEvent = { ...event };

          let staffingTop = (this.$moment(event.startDate).hours() - PLANNING_VIEW_START_HOUR) * 60 + this.$moment(event.startDate).minutes();
          let staffingBottom = (this.$moment(event.endDate).hours() - PLANNING_VIEW_START_HOUR) * 60 + this.$moment(event.endDate).minutes();
          if (!this.$moment(day).isSame(event.startDate, 'day')) {
            dayEvent.startDate = this.$moment(day).hour(PLANNING_VIEW_START_HOUR).toISOString();
            staffingTop = 0;
          }
          if (!this.$moment(day).isSame(event.endDate, 'day')) {
            dayEvent.endDate = this.$moment(day).hour(PLANNING_VIEW_END_HOUR).toISOString();
            staffingBottom = (PLANNING_VIEW_END_HOUR - PLANNING_VIEW_START_HOUR) * 60;
          }

          dayEvent.staffingTop = staffingTop;
          dayEvent.staffingHeight = staffingBottom - staffingTop;

          return dayEvent;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    createEvent (value) {
      this.$emit('createEvent', value);
    },
    editEvent (value) {
      this.$emit('editEvent', value);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .agenda-table
    td
      padding: 0px;
      height: 100%;

      .planning-background
        background: repeating-linear-gradient(
          180deg,
          $white,
          $white 13.1%,
          $grey-3,
          $grey-3 13.3%
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
        color: $light-grey;
        background-color: $white;
        font-size: 12px;
        padding: 0 5px
</style>
