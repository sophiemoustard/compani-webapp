<template>
  <div :class="[{ 'planning': !toggleDrawer }]">
    <div class="row items-center planning-header">
      <div class="col-xs-12 col-md-5 planning-search">
        <ni-chips-autocomplete ref="refFilter" v-model="terms" :disable="displayAllSectors" :filters="filters" />
        <q-btn v-if="!isCustomerPlanning && isCoach" flat round :icon="displayAllSectors ? 'arrow_forward' : 'people'"
          @click="toggleAllSectors" :color="displayAllSectors ? 'primary' : ''" />
      </div>
      <div class="col-xs-12 col-md-7">
        <div class="row full-width justify-between">
          <div class="col-10">
            <planning-navigation :timelineTitle="timelineTitle()" :targetDate="targetDate" :type="PLANNING"
              @goToNextWeek="goToNextWeek" @goToPreviousWeek="goToPreviousWeek" @goToToday="goToToday"
              @goToWeek="goToWeek" />
          </div>
          <q-btn v-if="isCoach || isPlanningReferent" class="planning-view" size="md" icon="highlight_off" flat round @click="toggleDeleteEventsModal" />
          <q-btn v-if="!isCustomerPlanning" class="planning-view" size="md" icon="playlist_play" flat round
            @click="toggleHistory" :color="displayHistory ? 'primary' : ''" />
        </div>
      </div>
    </div>
    <div class="planning-container full-width">
      <table style="width: 100%" :class="[staffingView ? 'staffing' : 'non-staffing', 'planning-table']">
        <thead>
          <th :class="{ 'bottom-border': persons.length > 0 }">
            <q-btn v-if="!isCustomerPlanning" flat round icon="view_week" :color="staffingView ? 'primary' : ''"
              @click="staffingView = !staffingView" />
          </th>
          <th class="capitalize" :class="{ 'bottom-border': persons.length > 0 }" :key="index"
            v-for="(day, index) in daysHeader">
            <div class="row justify-center items-baseline days-header">
              <div class="days-name q-mr-md">{{ day.name }}</div>
              <div :class="['days-number', { 'current-day': isCurrentDay(day.moment) }]">{{ day.number }}</div>
            </div>
            <div class="planning-background" v-if="staffingView">
              <template v-for="(hour, hourIndex) in hours">
                <div class="planning-hour" v-if="hourIndex !== 0"  :key="hourIndex"
                  :style="{ left: `${(hourIndex * hourWidth * 2) - 3}%` }">{{ hour.format('H') }}</div>
              </template>
            </div>
          </th>
        </thead>
        <tbody>
          <template v-for="sectorId in Object.keys(personsGroupedBySector)">
            <tr v-if="!isCustomerPlanning && getSector(sectorId)" :key="sectorId" class="to-assign person-row">
              <td valign="top">
                <div class="person-inner-cell">
                  <div :class="[!staffingView && 'q-mb-md', 'chip-container']">
                    <img :src="UNKNOWN_AVATAR" class="avatar" >
                    <q-chip small text-color="white">
                      <span class="chip-indicator">{{ unassignedHourCount(sectorId) }}h</span>
                    </q-chip>
                  </div>
                  <div class="person-name overflow-hidden">{{ getSector(sectorId).label }}</div>
                </div>
              </td>
              <td @drop="drop(day, getSector(sectorId))" @dragover.prevent v-for="(day, dayIndex) in days" valign="top"
                :key="dayIndex" @click="createEvent({ dayIndex, sectorId })" class="planning-background">
                <div v-for="hourIndex in 5" class="line" :style="{ left: `${(hourIndex * hourWidth * 2)}%` }"
                  :key="`hour_${hourIndex}`" />
                <ni-planning-event-cell v-for="(event, eventIndex) in getCellEvents(sectorId, days[dayIndex])"
                  :event="event" :display-staffing-view="staffingView && !isCustomerPlanning" :person-key="personKey"
                  :key="eventIndex" @drag="drag" @editEvent="editEvent" :can-drag="canEdit" />
              </td>
            </tr>
            <tr class="person-row" v-for="person in personsGroupedBySector[sectorId]" :key="person._id">
              <td valign="top">
                <div class="person-inner-cell">
                  <div :class="[!staffingView && 'q-mb-md']">
                    <ni-chip-customer-indicator v-if="isCustomerPlanning" :person="person"
                      :events="getPersonEvents(person)" />
                    <ni-chip-auxiliary-indicator v-else :person="person" :events="getPersonEvents(person)"
                      :startOfWeek="startOfWeek" :dm="distanceMatrix" :working-stats="workingStats[person._id]" />
                  </div>
                  <div class="person-name overflow-hidden-nowrap">
                    <template v-if="isCustomerPlanning">{{ person.identity | formatIdentity('fL') }}</template>
                    <template v-else>{{ person.identity | formatIdentity('Fl') }}</template>
                  </div>
                </div>
              </td>
              <td @drop="drop(day, person)" @dragover.prevent v-for="(day, dayIndex) in days" :key="dayIndex"
                valign="top" @click="createEvent({ dayIndex, person })" class="planning-background">
                <div v-for="hourIndex in hours.length" class="line" :key="`hour_${hourIndex}`"
                  :style="{ left: `${(hourIndex * hourWidth * 2)}%` }" />
                <ni-planning-event-cell v-for="(event, eventIndex) in getCellEvents(person._id, days[dayIndex])"
                  :event="event" :display-staffing-view="staffingView && !isCustomerPlanning" :person-key="personKey"
                  :key="eventIndex" @drag="drag" @editEvent="editEvent" :can-drag="canEdit" />
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
    <q-page-sticky expand position="right">
      <ni-event-history-feed v-if="displayHistory" :eventHistories="eventHistories" @toggleHistory="toggleHistory"
        @updateFeeds="$emit('updateFeeds', $event)" />
    </q-page-sticky>
    <delete-events-modal v-model="deleteEventsModal" @hide="deleteEventsModal=false" />
  </div>
</template>

<script>
import {
  PLANNING,
  AUXILIARY_ROLES,
  INVOICED_AND_PAID,
  SECTOR,
  STAFFING_VIEW_START_HOUR,
  STAFFING_VIEW_END_HOUR,
  UNKNOWN_AVATAR,
  PLANNING_REFERENT,
  COACH,
  ADMIN,
  NOT_INVOICED_AND_NOT_PAID,
} from '../../data/constants';
import { NotifyNegative, NotifyWarning } from '../popup/notify';
import ChipAuxiliaryIndicator from './ChipAuxiliaryIndicator';
import NiChipCustomerIndicator from './ChipCustomerIndicator';
import NiPlanningEvent from './PlanningEvent';
import NiEventHistoryFeed from './EventHistoryFeed';
import ChipsAutocomplete from './ChipsAutocomplete';
import DeleteEventsModal from './DeleteEventsModal';
import { planningTimelineMixin } from '../../mixins/planningTimelineMixin';
import { planningEventMixin } from '../../mixins/planningEventMixin';
import PlanningNavigation from './PlanningNavigation.vue';
import distanceMatrix from '../../api/DistanceMatrix';
import { formatIdentity } from '../../helpers/utils';
import { mapGetters } from 'vuex';

export default {
  name: 'PlanningManager',
  mixins: [planningTimelineMixin, planningEventMixin],
  components: {
    'ni-chip-customer-indicator': NiChipCustomerIndicator,
    'ni-chip-auxiliary-indicator': ChipAuxiliaryIndicator,
    'ni-planning-event-cell': NiPlanningEvent,
    'ni-chips-autocomplete': ChipsAutocomplete,
    'planning-navigation': PlanningNavigation,
    'ni-event-history-feed': NiEventHistoryFeed,
    'delete-events-modal': DeleteEventsModal,
  },
  props: {
    workingStats: { type: Object, default: () => ({}) },
    events: { type: Array, default: () => [] },
    persons: { type: Array, default: () => [] },
    filteredSectors: { type: Array, default: () => [] },
    personKey: { type: String, default: 'auxiliary' },
    canEdit: { type: Function, default: () => {} },
    displayAllSectors: { type: Boolean, default: false },
    displayHistory: { type: Boolean, default: false },
    eventHistories: { type: Array, default: () => [] },
    filters: { type: Array, default: () => [] },
  },
  data () {
    return {
      terms: [],
      loading: false,
      draggedObject: {},
      startOfWeek: this.$moment().startOf('week').toISOString(),
      days: [],
      maxDays: 7,
      staffingView: false,
      PLANNING,
      distanceMatrix: [],
      hourWidth: 100 / 12,
      UNKNOWN_AVATAR,
      deleteEventsModal: false,
    }
  },
  beforeDestroy () {
    if (!AUXILIARY_ROLES.includes(this.mainUser.role.name)) {
      if (!this.isCustomerPlanning) {
        this.$q.localStorage.set('lastSearchAuxiliaries', JSON.stringify(this.terms));
      } else {
        this.$q.localStorage.set('lastSearchCustomers', JSON.stringify(this.terms));
      }
    }
  },
  async mounted () {
    this.updateTimeline();
    this.getTimelineHours();
    if (!this.isCustomerPlanning) await this.getDistanceMatrix();
  },
  computed: {
    ...mapGetters({
      mainUser: 'main/user',
    }),
    isCoach () {
      return [COACH, ADMIN].includes(this.mainUser.role.name);
    },
    isPlanningReferent () {
      return this.mainUser.role.name === PLANNING_REFERENT;
    },
    personsGroupedBySector () {
      return this.$_.groupBy(this.persons, 'sector._id');
    },
  },
  methods: {
    toggleDeleteEventsModal () {
      this.deleteEventsModal = !this.deleteEventsModal;
    },
    toggleAllSectors () {
      this.$emit('toggleAllSectors', this.terms);
      this.terms = [];
    },
    getSector (sectorId) {
      return this.filteredSectors.find(s => s._id === sectorId);
    },
    restoreFilter (terms) {
      for (let term of terms) {
        setTimeout(() => this.$refs.refFilter.add(term), 100);
      }
    },
    getTimelineHours () {
      const range = this.$moment.range(this.$moment().hours(STAFFING_VIEW_START_HOUR).minutes(0), this.$moment().hours(STAFFING_VIEW_END_HOUR).minutes(0));
      this.hours = Array.from(range.by('hours', { step: 2, excludeEnd: true }));
    },
    async getDistanceMatrix () {
      this.distanceMatrix = await distanceMatrix.list();
    },
    // Table
    updateTimeline () {
      this.getTimelineDays();
      this.$emit('updateStartOfWeek', { startOfWeek: this.startOfWeek });
    },
    // Event display
    unassignedHourCount (sectorId) {
      const unassignedEvents = this.getPersonEvents({ _id: sectorId });
      let total = 0;
      for (const event of unassignedEvents) {
        total += this.$moment(event.endDate).diff(event.startDate, 'm', true);
      }

      return total / 60;
    },
    getRowEvents (rowId) {
      const rowEvents = this.events.find(group => group._id === rowId);

      return (!rowEvents || !rowEvents.events) ? [] : rowEvents.events;
    },
    getCellEvents (cellId, day) {
      return this.getRowEvents(cellId)
        .filter(event =>
          this.$moment(day).isBetween(event.startDate, event.endDate, 'day', '[]') &&
          (!this.staffingView || !event.isCancelled)
        )
        .map((event) => this.isCustomerPlanning ? event : this.getDisplayedEvent(event, day, STAFFING_VIEW_START_HOUR, STAFFING_VIEW_END_HOUR))
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
    },
    getPersonEvents (person) {
      if (this.isCustomerPlanning) {
        return this.getRowEvents(person._id).filter(event => !event.isCancelled || event.cancel.condition !== NOT_INVOICED_AND_NOT_PAID);
      }

      return this.getRowEvents(person._id).filter(event => !event.isCancelled || event.cancel.condition === INVOICED_AND_PAID);
    },
    // History
    toggleHistory () {
      if (this.persons.length === 0) return;
      this.$emit('toggleHistory', !this.displayHistory);
    },
    // Drag & drop
    drag (event) {
      this.draggedObject = event;
    },
    async drop (toDay, target) {
      try {
        if (target.type === SECTOR) { // Unassign event
          if (this.draggedObject.sector === target._id && (!this.draggedObject.auxiliary || !this.draggedObject.auxiliary._id) &&
            toDay.isSame(this.draggedObject.startDate, 'd')) return;
        } else { // Update event auxiliary
          if (this.draggedObject[this.personKey] && this.draggedObject[this.personKey]._id === target._id &&
            toDay.isSame(this.draggedObject.startDate, 'd')) return;
        }

        this.$emit('onDrop', { toDay, target, draggedObject: this.draggedObject });
      } catch (e) {
        console.error(e);
        NotifyNegative('Problème lors de la modification de l\'évènement');
      } finally {
        this.draggedObject = {};
      }
    },
    createEvent (eventInfo) {
      let can = true;
      if (this.personKey === 'auxiliary' && eventInfo.sectorId) { // Unassigned event
        can = this.$can({
          user: this.$store.getters['main/user'],
          auxiliarySectorEvent: eventInfo.sectorId,
          permissions: [{ name: 'events:edit' }],
        });
      } else if (this.personKey === 'auxiliary') {
        can = this.$can({
          user: this.$store.getters['main/user'],
          auxiliaryIdEvent: eventInfo.person._id,
          auxiliarySectorEvent: eventInfo.person.sector._id,
          permissions: [
            { name: 'events:edit' },
            { name: 'events:own:edit', rule: 'isOwner' },
          ],
        });
      }
      if (!can) return NotifyWarning('Vous n\'avez pas les droits pour réaliser cette action');

      this.$emit('createEvent', eventInfo);
    },
    editEvent (eventId) {
      this.$emit('editEvent', eventId);
    },
  },
  filters: {
    formatIdentity,
  },
}
</script>

<style lang="stylus" scoped>
  th:first-child
    @media (min-width: 768px) and (max-width: 1024px)
      width: 100px;
    @media (min-width: 1025px)
      width: 110px;

  .person
    &-row
      border-right: 1px solid $light-grey;
      height: 100px;
    &-name
      font-weight: 600;
      font-size: 14px;
      @media (max-width: 1024px)
        font-size: 12px;
      @media (max-width: 420px)
        font-size: 8px;
    &-inner-cell
      margin-top: 4px;

  .staffing
    .person
      &-row
        height: auto;
      &-name
        margin: 2px 0 4px;
    td
      position: relative;
      height: 75px;
      z-index: 0;
    .planning-background
      position: relative;
      margin-top: 2px;
      .line
        width: 1px;
        height: 100%;
        background: $grey-3;
        margin: 0;
        position: absolute;
        z-index: -1;

  .non-staffing
    .planning-background
      @media screen and (max-width: 1024px)
        padding-bottom: 2rem;
      @media screen and (min-width: 1025px)
        padding-bottom: 1rem;

  .to-assign
    background-color: rgba(253, 243, 229, 0.5);

  .q-page-sticky
    z-index: 20;

</style>
