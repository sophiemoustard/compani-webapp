<template>
  <div class="row q-mb-md">
    <div class="col-11 person-name">
      <img :src="avatar" class="avatar">
      <div class="person-name-text" v-if="options.length === 0">{{ formattedIdentity }}</div>
      <div v-else :class="{ 'col-md-6': $q.platform.is.desktop }" class="person-name-select">
        <ni-select no-border :model-value="modelValue" :options="options" @update:model-value="input" no-error
          :disable="disable" icon="swap_vert" />
      </div>
    </div>
    <div class="col-1 cursor-pointer modal-btn-close">
      <ni-button icon="close" @click="close" />
    </div>
  </div>
</template>

<script>
import get from 'lodash/get';
import Select from '@components/form/Select';
import Button from '@components/Button';
import { formatIdentity } from '@helpers/utils';
import { UNKNOWN_AVATAR, DEFAULT_AVATAR } from '@data/constants';

export default {
  name: 'PlanningModalHeader',
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    selectedPerson: { type: Object, default: () => ({}) },
    disable: { type: Boolean, default: false },
  },
  components: {
    'ni-select': Select,
    'ni-button': Button,
  },
  emits: ['close', 'update:model-value'],
  computed: {
    formattedIdentity () {
      return formatIdentity(this.selectedPerson.identity, 'FL');
    },
    avatar () {
      return (!this.selectedPerson || !this.selectedPerson._id)
        ? UNKNOWN_AVATAR
        : get(this.selectedPerson, 'picture.link') || DEFAULT_AVATAR;
    },
  },
  methods: {
    input (event) {
      this.$emit('update:model-value', event);
    },
    close () {
      this.$emit('close');
    },
  },
};
</script>

<style lang="sass" scoped>
.person-name
  &-text
    padding: 9px 14px 11px
    margin-left: 5px
    @media screen and (max-width: 767px)
      font-size: 14px !important
  &-select
    @media screen and (max-width: 767px)
      width: 80%
</style>
