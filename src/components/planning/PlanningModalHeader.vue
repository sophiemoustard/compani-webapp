<template>
  <div class="row q-mb-md">
    <div class="col-11 row person-name">
      <img :src="avatar" class="avatar">
      <div class="person-name-text" v-if="options.length === 0">{{ formattedIdentity }}</div>
      <q-select v-else filter :value="value" color="white" inverted-light :options="options"
        :after="[{ icon: 'swap_vert', class: 'select-icon pink-icon', handler () { $refs['personSelect'].show() } }]"
        :filter-placeholder="placeholder" ref="personSelect" @input="$emit('input', $event)" />
    </div>
    <div class="col-1 cursor-pointer modal-btn-close">
      <span><q-icon name="clear" @click.native="$emit('close')" /></span>
    </div>
  </div>
</template>

<script>
import { UNKNOWN_AVATAR, DEFAULT_AVATAR } from '../../data/constants';
import { formatIdentity } from '../../helpers/utils';

export default {
  name: 'PlanningModalHeader',
  props: {
    value: { type: String },
    options: { type: Array, default: () => [] },
    selectedPerson: { type: Object, default: () => ({}) },
  },
  computed: {
    formattedIdentity () {
      return formatIdentity(this.selectedPerson.identity, 'FL');
    },
    personName () {
      return this.selectedPerson.identity ? formatIdentity(this.selectedPerson.identity, 'FL') : 'À affecter';
    },
    avatar () {
      return (!this.selectedPerson || !this.selectedPerson._id)
        ? UNKNOWN_AVATAR
        : this.$_.get(this.selectedPerson, 'picture.link') || DEFAULT_AVATAR;
    },
    placeholder () {
      const firstname = this.$_.get(this.selectedPerson, 'identity.firstname');
      const lastname = this.$_.get(this.selectedPerson, 'identity.lastname');
      return (firstname && lastname)
        ? `${firstname} ${lastname}`
        : 'À affecter';
    },
  },
}
</script>
