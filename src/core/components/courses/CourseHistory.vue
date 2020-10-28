<template>
  <div class="history-cell">
    <div class="row title">
      <div class="col-11">
        {{ formatedHistory.title.pre }}<span class="title-type"> {{ formatedHistory.title.type }}</span>
        {{ formatedHistory.title.post }}<span class="title-bold"> {{ formatedHistory.title.infos }}</span>
      </div>
      <ni-button class="col-1 button" v-if="formatedHistory.details" color="primary" size="sm" icon="remove_red_eye"
        @click="toggleDetails" />
    </div>
    <div class="history-details" v-if="displayDetails">
      {{ formatedHistory.details }}
    </div>
    <div class="history-signature">
      <img size="20px" :src="getAvatar(courseHistory.createdBy)" class="avatar">
      <div>{{ historySignature }}</div>
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import { SLOT_CREATION, DEFAULT_AVATAR } from '@data/constants';
import Button from '@components/Button';
import { formatIdentity } from '@helpers/utils';

export default {
  name: 'CourseHistory',
  props: {
    courseHistory: { type: Object, default: () => ({}) },
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
        case SLOT_CREATION:
        default:
          return {
            title: this.getSlotCreationTitle(),
            details: this.getSlotCreationDetails(),
          };
      }
    },
    historySignature () {
      const date = this.$moment(this.courseHistory.createdAt).format('DD/MM');
      const hour = `${this.$moment(this.courseHistory.createdAt).hour()}h`
        + `${this.$moment(this.courseHistory.createdAt).format('mm')}`;
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
      const date = this.$moment(this.courseHistory.slot.startDate).format('DD/MM');
      const startHour = `${this.$moment(this.courseHistory.slot.startDate).hour()}h`
        + `${this.$moment(this.courseHistory.slot.startDate).format('mm')}`;
      const endHour = `${this.$moment(this.courseHistory.slot.endDate).hour()}h`
        + `${this.$moment(this.courseHistory.slot.endDate).format('mm')}`;
      const infos = `${date} de ${startHour} à ${endHour}`;

      return { pre: 'Nouveau', type: 'créneau', post: 'le', infos };
    },
    getSlotCreationDetails () {
      return get(this.courseHistory, 'slot.address.fullAddress', 'Pas d\'addresse renseignée');
    },
  },
};
</script>

<style lang="stylus" scoped>
  .history-cell
    width: 100%
    display: block
    font-size: 13px
    padding: 0 8px
    margin-top: 16px
    &:after
      content: ""
      display: block
      margin: auto
      border-bottom: 1px solid $neutral-grey

  .title
    align-items: center
    margin-right: 16px
    &-type
      color: $primary
    &-bold
      font-weight: bold
      color: #2E2E2E

  .history-details
    font-size: 12px
    color: $dark-grey

  .avatar
    height: 20px
    width: 20px

  .history-signature
    color: $dark-grey
    font-size: 12px
    font-style: italic
    display: flex
    align-items: center
    margin-bottom: 4px
    div
      margin-left: 4px
</style>
