<template>
  <div class="q-mx-sm">
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
      <ni-button v-if="canUpdateSalesRepresentative" icon="edit" @click="openEditionModal()" :disable="disable" />
    </q-card>
  </div>
</template>

<script>
import get from 'lodash/get';
import pick from 'lodash/pick';
import { computed } from 'vue';
import { useStore } from 'vuex';
import Button from '@components/Button';
import { DEFAULT_AVATAR } from '@data/constants';
import { formatIdentity, formatPhone } from '@helpers/utils';
import { defineAbilitiesFor } from '@helpers/ability';

export default {
  name: 'InterlocutorCell',
  props: {
    interlocutor: { type: Object, default: () => ({}) },
    caption: { type: String, default: '' },
    openEditionModal: { type: Function, default: () => {} },
    disable: { type: Boolean, default: false },
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

    const getAvatar = picture => get(picture, 'link') || DEFAULT_AVATAR;
    return {
      // Data
      DEFAULT_AVATAR,
      // Computed
      canUpdateSalesRepresentative,
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
.interlocutor-cell
  border-radius: 4px
  background-color: white
  padding: 8px
.avatar
  width: 40px
  height: 40px
  border-radius: 50%
  vertical-align: middle
.phone
  color: $copper-grey-500
  font-size: 14px
  height: 21px
</style>
