<template>
  <div class="history">
    <div class="history-cell">
      <div class="q-mb-sm">
        <div v-for="(info, index) in historyInfos" class="history-title-text" :key="`info${index}`">
          <span class="history-type">{{ info.label }}</span>{{ info.details }}
        </div>
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
import { NOTE_CREATION, NOTE_UPDATE, DEFAULT_AVATAR } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import { formatDate, formatHoursWithMinutes } from '@helpers/date';

export default {
  name: 'CustomerNoteHistory',
  props: {
    history: { type: Object, default: () => ({}) },
  },
  computed: {
    historyInfos () {
      switch (this.history.action) {
        case NOTE_UPDATE: {
          const result = [];
          if (this.history.description) {
            result.push({ label: 'Nouvelle description : ', details: this.history.description });
          }
          if (this.history.title) result.push({ label: 'Nouveau titre : ', details: this.history.title });
          return result;
        }
        case NOTE_CREATION:
        default:
          return [
            { label: 'Titre : ', details: this.history.title },
            { label: 'Description : ', details: this.history.description },
          ];
      }
    },
    historySignature () {
      const date = formatDate(this.history.createdAt);
      const hour = formatHoursWithMinutes(this.history.createdAt);
      const user = formatIdentity(this.history.createdBy.identity, 'Fl');

      return `${user} le ${date} à ${hour}.`;
    },
  },
  methods: {
    getAvatar (user) {
      return get(user, 'picture.link') || DEFAULT_AVATAR;
    },
  },
};
</script>
