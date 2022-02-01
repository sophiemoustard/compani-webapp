<template>
  <div class="history">
    <div class="history-cell">
      <div class="history-title">
        <div class="history-title-text">
          {{ formatedHistory.title.pre }}
          <span class="history-type">{{ formatedHistory.title.type }}</span>
          {{ formatedHistory.title.post }}
          <span class="history-info"> {{ formatedHistory.title.infos }}.</span>
        </div>
        <ni-button class="history-button" v-if="formatedHistory.details" color="primary" size="sm" icon="remove_red_eye"
          @click="toggleDetails" />
      </div>
      <div class="history-details" v-if="displayDetails">
        <div>{{ formatedHistory.details }}</div>
      </div>
      <div class="history-signature">
        <img :src="getAvatar(courseHistory.createdBy)" class="avatar history-avatar">
        <div>{{ historySignature }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import {
  SLOT_CREATION,
  DEFAULT_AVATAR,
  SLOT_DELETION,
  SLOT_EDITION,
  TRAINEE_ADDITION,
  TRAINEE_DELETION,
} from '@data/constants';
import Button from '@components/Button';
import moment from '@helpers/moment';
import { formatIdentity } from '@helpers/utils';
import { formatHoursWithMinutes } from '@helpers/date';

export default {
  name: 'CourseHistory',
  props: {
    courseHistory: { type: Object, required: true },
  },
  components: {
    'ni-button': Button,
  },
  data () {
    return {
      displayDetails: false,
    };
  },
  computed: {
    formatedHistory () {
      switch (this.courseHistory.action) {
        case TRAINEE_DELETION:
          return { title: this.getTraineeDeletionTitle() };
        case TRAINEE_ADDITION:
          return { title: this.getTraineeAdditionTitle() };
        case SLOT_DELETION:
          return {
            title: this.getSlotDeletionTitle(),
            details: this.getSlotDeletionDetails(),
          };
        case SLOT_EDITION:
          return {
            title: this.getSlotEditionTitle(),
            details: this.getSlotEditionDetails(),
          };
        case SLOT_CREATION:
        default:
          return {
            title: this.getSlotCreationTitle(),
            details: this.getSlotCreationDetails(),
          };
      }
    },
    historySignature () {
      const date = moment(this.courseHistory.createdAt).format('DD/MM');
      const hour = formatHoursWithMinutes(this.courseHistory.createdAt);
      const user = formatIdentity(this.courseHistory.createdBy.identity, 'FL');

      return `${user} le ${date} à ${hour}.`;
    },
  },
  methods: {
    toggleDetails () {
      this.displayDetails = !this.displayDetails;
    },
    getAvatar (user) {
      return get(user, 'picture.link') || DEFAULT_AVATAR;
    },
    getSlotCreationTitle () {
      const date = moment(this.courseHistory.slot.startDate).format('DD/MM');
      const startHour = formatHoursWithMinutes(this.courseHistory.slot.startDate);
      const endHour = formatHoursWithMinutes(this.courseHistory.slot.endDate);
      const infos = `${date} de ${startHour} à ${endHour}`;

      return { pre: 'Nouveau', type: 'créneau', post: 'le', infos };
    },
    getSlotCreationDetails () {
      return get(this.courseHistory, 'slot.address.fullAddress', 'Pas d\'adresse renseignée.');
    },
    getSlotDeletionTitle () {
      const date = moment(this.courseHistory.slot.startDate).format('DD/MM');

      return { pre: 'Suppression du', type: 'créneau', post: 'du', infos: `${date}` };
    },
    getSlotDeletionDetails () {
      const address = get(this.courseHistory, 'slot.address.fullAddress', '');

      return `Créneau initialement prévu de ${formatHoursWithMinutes(this.courseHistory.slot.startDate)}`
        + ` à ${formatHoursWithMinutes(this.courseHistory.slot.endDate)}`
        + `${address ? `, au ${address}.` : '.\r\nPas d\'adresse renseignée.'}`;
    },
    getSlotEditionTitle () {
      if (this.courseHistory.update.startDate) {
        const from = moment(this.courseHistory.update.startDate.from).format('DD/MM');
        const to = moment(this.courseHistory.update.startDate.to).format('DD/MM');

        return { type: 'Créneau', post: ' déplacé du', infos: `${from} au ${to}` };
      }
      if (this.courseHistory.update.startHour) {
        const date = moment(this.courseHistory.update.startHour.from).format('DD/MM');
        const startHour = formatHoursWithMinutes(this.courseHistory.update.startHour.to);
        const endHour = formatHoursWithMinutes(this.courseHistory.update.endHour.to);

        return { type: 'Nouvel horaire', post: ' pour le créneau du', infos: `${date} : ${startHour} - ${endHour}` };
      }
    },
    getSlotEditionDetails () {
      if (this.courseHistory.update.startDate) return undefined;

      const oldStartHour = formatHoursWithMinutes(this.courseHistory.update.startHour.from);
      const oldEndHour = formatHoursWithMinutes(this.courseHistory.update.endHour.from);

      return `Créneau initialement prévu de ${oldStartHour} à ${oldEndHour}`;
    },
    getTraineeAdditionTitle () {
      return {
        pre: 'Ajout d\'un(e)',
        type: 'stagiaire',
        post: 'à la formation :',
        infos: `\r\n${formatIdentity(this.courseHistory.trainee.identity, 'FL')}`,
      };
    },
    getTraineeDeletionTitle () {
      return {
        pre: 'Retrait d\'un(e)',
        type: 'stagiaire',
        post: 'de la formation :',
        infos: `\r\n${formatIdentity(this.courseHistory.trainee.identity, 'FL')}`,
      };
    },
  },
};
</script>
