<template>
  <div class="cell-container q-mx-sm">
    <p class="input-caption">{{ caption }}</p>
    <q-card class="interlocutor-cell row justify-between items-start">
      <div class="row">
        <img :src="getAvatar(interlocutor.picture)" class="avatar q-my-sm">
        <div class="q-my-sm q-ml-md">
          <div class="text-copper-grey-700">{{ formatIdentity(interlocutor.identity, 'FL') }}</div>
          <div class="text-copper-grey-500 text-14">{{ interlocutor.local.email }}</div>
          <div class="phone">{{ formatPhone(get(interlocutor, 'contact.phone')) }}</div>
        </div>
      </div>
      <ni-button v-if="canUpdate" icon="edit" @click="openEditionModal()" :disable="disable" />
    </q-card>
  </div>
</template>

<script>
import get from 'lodash/get';
import Button from '@components/Button';
import { DEFAULT_AVATAR } from '@data/constants';
import { formatIdentity, formatPhone } from '@helpers/utils';

export default {
  name: 'InterlocutorCell',
  props: {
    interlocutor: { type: Object, default: () => ({}) },
    caption: { type: String, default: '' },
    openEditionModal: { type: Function, default: () => {} },
    canUpdate: { type: Boolean, default: false },
    disable: { type: Boolean, default: false },
  },
  components: {
    'ni-button': Button,
  },
  setup () {
    const getAvatar = picture => get(picture, 'link') || DEFAULT_AVATAR;
    return {
      // Data
      DEFAULT_AVATAR,
      // Methods
      formatIdentity,
      formatPhone,
      getAvatar,
      get,
    };
  },
};
</script>

<style lang="sass" scoped>
.cell-container
  display: flex
  flex-direction: column
.interlocutor-cell
  border-radius: 4px
  background-color: white
  padding: 8px
  flex: 1
.avatar
  width: 40px
  height: 40px
  border-radius: 50%
  vertical-align: middle
.phone
  color: $copper-grey-500
  font-size: 14px
</style>
