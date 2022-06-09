<template>
  <div class="container">
    <p class="input-caption">{{ caption }}</p>
    <div class="interlocutor-cell row justify-between items-start">
      <div class="row">
        <img :src="getAvatar(interlocutor.picture)" class="avatar q-my-sm">
        <div class="q-my-sm q-ml-md">
          <div class="text-copper-grey-700 text-weight-bold">{{ formatIdentity(interlocutor.identity, 'FL') }}</div>
          <div class="text-copper-grey-500">{{ interlocutor.local.email }}</div>
          <div class="text-copper-grey-500">{{ interlocutor.contact.phone }}</div>
        </div>
      </div>
      <ni-button v-if="canUpdateSalesRepresentative" icon="edit" @click="openEditionModal()" />
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import pick from 'lodash/pick';
import { computed } from 'vue';
import { useStore } from 'vuex';
import Button from '@components/Button';
import { DEFAULT_AVATAR } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import { defineAbilitiesFor } from '@helpers/ability';

export default {
  name: 'InterlocutorCell',
  props: {
    interlocutor: { type: Object, default: () => ({}) },
    caption: { type: String, default: '' },
    openEditionModal: { type: Function, default: () => {} },
  },
  components: {
    'ni-button': Button,
  },
  setup () {
    const $store = useStore();

    const loggedUser = computed(() => $store.state.main.loggedUser);

    const canUpdateSalesRepresentative = computed(() => {
      const ability = defineAbilitiesFor(pick(loggedUser.value, ['role']));

      return ability.can('update', 'interlocutor');
    });

    const getAvatar = picture => (get(picture, 'link')) || DEFAULT_AVATAR;
    return {
      // Data
      DEFAULT_AVATAR,
      // Computed
      canUpdateSalesRepresentative,
      // Methods
      formatIdentity,
      getAvatar,
    };
  },
};
</script>

<style lang="sass" scoped>
.container
  width: 40%
.interlocutor-cell
  border-radius: 8px
  box-shadow: 0 3px 5px -1px rgba(0,0,0,0.2), 0 5px 8px rgba(0,0,0,0.14), 0 1px 14px rgba(0,0,0,0.12)
  background-color: white
  padding: 8px
.avatar
  width: 40px
  height: 40px
  border-radius: 50%
  box-shadow: 0 1px 3px rgba(0,0,0,0.2), 0 1px 1px rgba(0,0,0,0.14), 0 2px 1px -1px rgba(0,0,0,0.12)
  vertical-align: middle
  @media screen and (max-width: $breakpoint-sm-max)
    height: 60px
    width: 60px
</style>
