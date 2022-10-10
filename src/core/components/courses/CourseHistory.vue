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
import CompaniDate from '@helpers/dates/companiDates';
import { formatIdentity } from '@helpers/utils';

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
      const date = CompaniDate(this.courseHistory.createdAt).format('dd/LL');
      const hour = CompaniDate(this.courseHistory.createdAt).format('HH\'h\'mm');
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
      const date = CompaniDate(this.courseHistory.slot.startDate).format('dd/LL');
      const startHour = CompaniDate(this.courseHistory.slot.startDate).format('HH\'h\'mm');
      const endHour = CompaniDate(this.courseHistory.slot.endDate).format('HH\'h\'mm');
      const infos = `${date} de ${startHour} à ${endHour}`;

      return { pre: 'Nouveau', type: 'créneau', post: 'le', infos };
    },
    getSlotCreationDetails () {
      return get(this.courseHistory, 'slot.address.fullAddress') || get(this.courseHistory, 'slot.meetingLink') ||
        'Pas d\'adresse renseignée.';
    },
    getSlotDeletionTitle () {
      const date = CompaniDate(this.courseHistory.slot.startDate).format('dd/LL');

      return { pre: 'Suppression du', type: 'créneau', post: 'du', infos: date };
    },
    getSlotDeletionDetails () {
      let address = '.\r\nPas d\'adresse renseignée.';
      if (get(this.courseHistory, 'slot.address.fullAddress')) {
        address = ` au ${get(this.courseHistory, 'slot.address.fullAddress')}`;
      } else if (get(this.courseHistory, 'slot.meetingLink')) {
        address = ` sur ${get(this.courseHistory, 'slot.meetingLink')}`;
      }

      return `Créneau initialement prévu de ${CompaniDate(this.courseHistory.slot.startDate).format('HH\'h\'mm')}`
        + ` à ${CompaniDate(this.courseHistory.slot.endDate).format('HH\'h\'mm')}${address}`;
    },
    getSlotEditionTitle () {
      if (this.courseHistory.update.startDate) {
        const from = CompaniDate(this.courseHistory.update.startDate.from).format('dd/LL');
        const to = CompaniDate(this.courseHistory.update.startDate.to).format('dd/LL');

        return { type: 'Créneau', post: ' déplacé du', infos: `${from} au ${to}` };
      }
      if (this.courseHistory.update.startHour) {
        const date = CompaniDate(this.courseHistory.update.startHour.from).format('dd/LL');
        const startHour = CompaniDate(this.courseHistory.update.startHour.to).format('HH\'h\'mm');
        const endHour = CompaniDate(this.courseHistory.update.endHour.to).format('HH\'h\'mm');

        return { type: 'Nouvel horaire', post: ' pour le créneau du', infos: `${date} : ${startHour} - ${endHour}` };
      }
    },
    getSlotEditionDetails () {
      if (this.courseHistory.update.startDate) return undefined;

      const oldStartHour = CompaniDate(this.courseHistory.update.startHour.from).format('HH\'h\'mm');
      const oldEndHour = CompaniDate(this.courseHistory.update.endHour.from).format('HH\'h\'mm');

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
