<template>
  <div class="history">
    <div class="history-cell">
      <div class="history-title">
        <div class="history-title-text">
          {{ historyInfo.title.pre }}<span v-if="!isTimeStampingCancellation" class="history-type">{{ type }}</span>
          <template v-if="!isAuxiliaryUpdate && !isTimestamping && !isTimeStampingCancellation">
            de <span class="history-info">{{ auxiliaryName }}</span>
          </template>
          {{ historyInfo.title.post }}
        </div>
        <q-btn v-if="historyInfo.details" color="primary" size="10px" flat round icon="remove_red_eye"
          @click="toggleDetails" class="history-button" />
      </div>
      <div v-if="displayDetails" class="history-details">
        <div>{{ historyInfo.details }}</div>
        <div class="history-misc">{{ history.event.misc }}</div>
      </div>
      <div class="history-signature">
        <img :src="getAvatar(history.createdBy)" class="avatar history-avatar">
        <div>{{ historySignature }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import {
  EVENT_CREATION,
  INTERNAL_HOUR,
  ABSENCE,
  EVENT_DELETION,
  DEFAULT_AVATAR,
  ABSENCE_TYPES,
  EVENT_TYPES,
  INTERVENTION,
  UNAVAILABILITY,
  NEVER,
  EVERY_DAY,
  EVERY_WEEK_DAY,
  EVERY_WEEK,
  EVERY_TWO_WEEKS,
  EVENT_UPDATE,
  CANCELLATION_OPTIONS,
  MANUAL_TIME_STAMPING,
  MANUAL_TIME_STAMPING_REASONS,
  TIME_STAMPING_ACTIONS,
  QR_CODE_TIME_STAMPING,
  TIME_STAMP_CANCELLATION,
} from '@data/constants';
import { formatIdentity, formatHoursWithMinutes } from '@helpers/utils';
import moment from '@helpers/moment';

export default {
  name: 'EventHistory',
  props: {
    history: { type: Object, default: () => ({}) },
    active: { type: Boolean, default: false },
  },
  data () {
    return {
      displayDetails: false,
    };
  },
  computed: {
    auxiliaryName () {
      return get(this.history, 'event.auxiliary.identity')
        ? formatIdentity(this.history.event.auxiliary.identity, 'Fl')
        : 'À affecter';
    },
    customerName () {
      return !!get(this.history, 'event.customer.identity') &&
        formatIdentity(this.history.event.customer.identity, 'fL');
    },
    startDate () {
      return moment(this.history.event.startDate).format('DD/MM');
    },
    endDate () {
      return moment(this.history.event.endDate).format('DD/MM');
    },
    startHour () {
      return formatHoursWithMinutes(this.history.event.startDate);
    },
    endHour () {
      return formatHoursWithMinutes(this.history.event.endDate);
    },
    isOneDayEvent () {
      return moment(this.history.event.startDate).isSame(this.history.event.endDate, 'day');
    },
    isRepetition () {
      const { repetition } = this.history.event;
      return !!repetition && repetition.frequency !== NEVER;
    },
    isAuxiliaryUpdate () {
      return this.history.action === EVENT_UPDATE && !!this.history.update.auxiliary;
    },
    repetitionFrequency () {
      if (!this.isRepetition) return;

      const { repetition, startDate } = this.history.event;
      const day = moment(startDate).format('dddd');
      switch (repetition.frequency) {
        case EVERY_DAY:
          return 'tous les jours';
        case EVERY_WEEK_DAY:
          return 'du lundi au vendredi';
        case EVERY_WEEK:
          return `tous les ${day}s`;
        case EVERY_TWO_WEEKS:
          return `le ${day} une semaine sur 2`;
        default:
          return '';
      }
    },
    eventType () {
      if (!get(this.history, 'event.type')) return '';

      const { type } = this.history.event;
      if (this.isRepetition && type === INTERVENTION) return 'répétition';
      if (type === INTERNAL_HOUR) return 'heure interne';

      const eventType = EVENT_TYPES.find(t => t.value === type);
      return eventType ? eventType.label.toLowerCase() : '';
    },
    timeStampingType () {
      if (!this.isTimestamping) return '';
      return this.history.action === MANUAL_TIME_STAMPING ? 'Manuel' : 'QR code';
    },
    type () {
      return this.timeStampingType || this.eventType;
    },
    isTimestamping () {
      return TIME_STAMPING_ACTIONS.includes(this.history.action);
    },
    isTimeStampingCancellation () {
      return this.history.action === TIME_STAMP_CANCELLATION;
    },
    eventName () {
      const { type, internalHour, absence } = this.history.event;
      switch (type) {
        case UNAVAILABILITY:
          return 'Indispo';
        case INTERNAL_HOUR:
          return internalHour.name;
        case ABSENCE: {
          const absenceName = ABSENCE_TYPES.find(abs => abs.value === absence);
          return absenceName ? absenceName.label : 'Absence';
        }
        case INTERVENTION:
          return 'Intervention';
        default:
          return '';
      }
    },
    historyInfo () {
      switch (this.history.action) {
        case EVENT_DELETION:
          return {
            title: this.getEventDeletionTitle(),
            details: this.getEventDeletionDetails(),
          };
        case EVENT_UPDATE:
          return {
            title: this.getEventUpdateTitle(),
            details: this.getEventUpdateDetails(),
          };
        case MANUAL_TIME_STAMPING:
        case QR_CODE_TIME_STAMPING:
          return {
            title: this.getEventTimeStampingTitle(),
            details: this.getEventTimeStampingDetails(),
          };
        case TIME_STAMP_CANCELLATION:
          return {
            title: this.getTimeStampCancellationTitle(),
            details: this.getTimeStampCancellationDetails(),
          };
        case EVENT_CREATION:
        default:
          return {
            title: this.getEventCreationTitle(),
            details: this.getEventCreationDetails(),
          };
      }
    },
    historySignature () {
      const date = moment(this.history.createdAt).format('DD/MM');
      const hour = formatHoursWithMinutes(this.history.createdAt);
      const user = formatIdentity(this.history.createdBy.identity, 'Fl');

      return `${user} le ${date} à ${hour}.`;
    },
  },
  methods: {
    getAvatar (user) {
      return get(user, 'picture.link') || DEFAULT_AVATAR;
    },
    toggleDetails () {
      this.displayDetails = !this.displayDetails;
    },
    // Creation
    getEventCreationTitle () {
      const pre = 'Nouvelle ';
      let post;
      if (!this.isOneDayEvent) post = ` du ${this.startDate} au ${this.endDate}.`;
      else if (this.isRepetition && this.customerName) post = ` ${this.repetitionFrequency} chez ${this.customerName}.`;
      else if (this.isRepetition) post = ` ${this.repetitionFrequency}.`;
      else if (this.customerName) post = ` le ${this.startDate} chez ${this.customerName}.`;
      else post = ` le ${this.startDate}.`;

      return { pre, post };
    },
    getEventCreationDetails () {
      if (!this.isOneDayEvent) return `${this.eventName} planifié(e) du ${this.startDate} au ${this.endDate}.`;

      let details;
      if (this.isRepetition) {
        details = `${this.eventName}s planifié(e)s de ${this.startHour} à ${this.endHour} `
          + `à partir du ${this.startDate}.`;
      } else details = `${this.eventName} planifié(e) le ${this.startDate} de ${this.startHour} à ${this.endHour}.`;

      const { address } = this.history.event;

      return address && address.fullAddress ? `${details} ${address.fullAddress}.` : details;
    },
    // Deletion
    getEventDeletionTitle () {
      let post;
      const pronom = this.history.event.type === INTERVENTION && this.isRepetition ? 'la ' : 'l\'';
      const pre = `Suppression de ${pronom}`;
      if (this.isRepetition) post = ` ${this.repetitionFrequency} à partir du ${this.startDate}`;
      else if (!this.isOneDayEvent) post = ` du ${this.startDate} au ${this.endDate}.`;
      else post = ` le ${this.startDate}`;

      return { pre, post: this.customerName ? `${post} chez ${this.customerName}.` : `${post}.` };
    },
    getEventDeletionDetails () {
      if (this.history.event.type === ABSENCE) return;

      let details;
      if (this.isRepetition) {
        details = `${this.eventName}s initialement prévu(e)s de ${this.startHour} à ${this.endHour} `
        + `à partir du ${this.startDate}.`;
      } else details = `${this.eventName} initialement prévu(e) de ${this.startHour} à ${this.endHour}.`;

      const { address } = this.history.event;

      return address && address.fullAddress ? `${details} ${address.fullAddress}.` : details;
    },
    // Time stamping
    getEventTimeStampingTitle () {
      if (this.history.update.startHour) {
        const { to } = this.history.update.startHour;
        return { pre: `Début de l'intervention horodatée à ${formatHoursWithMinutes(to)} - `, post: '' };
      }

      const { to } = this.history.update.endHour;
      return { pre: `Fin de l'intervention horodatée à ${formatHoursWithMinutes(to)} - `, post: '' };
    },
    getEventTimeStampingDetails () {
      const { startHour, endHour } = this.history.update;
      let details;

      if (startHour) {
        const startHourFrom = formatHoursWithMinutes(startHour.from);
        details = `Début initialement prévu à ${startHourFrom}. `;
      } else {
        const endHourFrom = formatHoursWithMinutes(endHour.from);
        details = `Fin initialement prévue à ${endHourFrom}. `;
      }

      if (this.history.action === MANUAL_TIME_STAMPING) {
        const reason = MANUAL_TIME_STAMPING_REASONS[this.history.manualTimeStampingReason];
        details += `Motif d’horodatage manuel : “${reason}”.`;
      }

      return details;
    },
    // TIME STAMP CANCELLATION
    getTimeStampCancellationTitle () {
      return get(this.history, 'linkedEventHistory.update.startHour')
        ? { pre: 'Horodatage de début d\'intervention annulé' }
        : { pre: 'Horodatage de fin d\'intervention annulé' };
    },
    getTimeStampCancellationDetails () {
      return `Motif : ${this.history.timeStampCancellationReason}`;
    },
    // Update
    getEventUpdateTitle () {
      const { auxiliary, startDate, cancel, startHour } = this.history.update;
      if (auxiliary) return this.formatAuxiliaryUpdateTitle();
      if (startDate) return this.formatDatesUpdateTitle();
      if (cancel) return this.formatCancelUpdateTitle();
      if (startHour) return this.formatHoursUpdateTitle();
    },
    formatAuxiliaryUpdateTitle () { // Auxiliary update : only for intervention and internal hour.
      const { from, to } = this.history.update.auxiliary;
      const toAuxiliary = to && to.identity ? formatIdentity(to.identity, 'Fl') : 'À affecter';
      const fromAuxiliary = from && from.identity ? formatIdentity(from.identity, 'Fl') : 'À affecter';

      const pronom = this.isRepetition && this.history.event.type === INTERVENTION ? 'la ' : 'l\'';
      const pre = `Changement d'auxiliaire pour ${pronom}`;
      let post = this.isRepetition ? ` ${this.repetitionFrequency}` : ` du ${this.startDate}`;
      if (this.customerName) post += ` chez ${this.customerName}`;
      if (to && to.identity && from && from.identity) post += `\xa0: ${toAuxiliary} remplace ${fromAuxiliary}`;
      else if (to && to.identity) post += `\xa0: affectée à ${toAuxiliary}`;
      else post += '\xa0: passée en à affecter.';

      return { pre, post };
    },
    formatDatesUpdateTitle () {
      const { endDate, startDate } = this.history.update;

      const pre = 'Changement de dates pour l\'';
      let post = this.customerName ? ` chez ${this.customerName}` : '';
      post += startDate && endDate
        ? `\xa0: du ${moment(startDate.to).format('DD/MM')} au ${moment(endDate.to).format('DD/MM')}.`
        : `\xa0: ${moment(startDate.to).format('DD/MM')}.`;

      return { pre, post };
    },
    formatHoursUpdateTitle () {
      const { endHour, startHour } = this.history.update;
      const { to: startHourTo } = startHour;
      const { to: endHourTo } = endHour;

      const pronom = this.isRepetition && this.history.event.type === INTERVENTION ? 'la ' : 'l\'';
      const pre = `Changement d'horaire pour ${pronom}`;
      let post = this.isRepetition ? ` ${this.repetitionFrequency}` : ` le ${this.startDate}`;
      if (this.customerName) post += ` chez ${this.customerName}`;
      post += `\xa0:  ${formatHoursWithMinutes(startHourTo)} - ${formatHoursWithMinutes(endHourTo)}.`;

      return { pre, post };
    },
    formatCancelUpdateTitle () { // Cancellation : only for intervention and not applied to repetitions.
      return { pre: 'Annulation de l\'', post: ` le ${this.startDate} chez ${this.customerName}.` };
    },
    getEventUpdateDetails () {
      const { auxiliary, startDate, cancel, startHour } = this.history.update;
      if (auxiliary) return this.getEventCreationDetails();
      if (startDate) return this.formatDatesUpdateDetails();
      if (cancel) {
        const condition = CANCELLATION_OPTIONS.find(opt => opt.value === cancel.condition);
        return condition
          ? `${this.getEventDeletionDetails()} ${condition.label}.`
          : `${this.getEventDeletionDetails()}`;
      }
      if (startHour) return this.formatHoursUpdateDetails();
    },
    formatDatesUpdateDetails () {
      const { endDate, startDate } = this.history.update;
      const startDateFrom = moment(startDate.from).format('DD/MM');
      const endDateFrom = endDate && moment(endDate.from).format('DD/MM');

      let details;
      if (!this.isOneDayEvent) {
        details = `${this.eventName}s initialement prévu(e)s du ${startDateFrom} au ${endDateFrom}.`;
      } else details = `${this.eventName} initialement prévu(e) le ${startDateFrom}.`;

      const { address } = this.history.event;

      return address && address.fullAddress ? `${details} ${address.fullAddress}.` : details;
    },
    formatHoursUpdateDetails () {
      const { endHour, startHour } = this.history.update;
      const startHourFrom = formatHoursWithMinutes(startHour.from);
      const endHourFrom = formatHoursWithMinutes(endHour.from);

      let details;
      if (this.isRepetition) {
        details = `${this.eventName}s initialement prévu(e)s de ${startHourFrom} à ${endHourFrom} `
          + `à partir du ${this.startDate}.`;
      } else details = `${this.eventName} initialement prévu(e) de ${startHourFrom} à ${endHourFrom}.`;

      const { address } = this.history.event;

      return address && address.fullAddress ? `${details} ${address.fullAddress}.` : details;
    },
  },
};
</script>
