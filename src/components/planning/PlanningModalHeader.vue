<template>
  <div class="row q-mb-md">
    <div class="col-11 person-name">
      <img :src="avatar" class="avatar">
      <div class="person-name-text" v-if="options.length === 0">{{ formattedIdentity }}</div>
      <q-select borderless dense emit-value :value="value" :options="options" @input="$emit('input', $event)"
        ref="personSelect" :display-value="placeholder" behavior="menu">
        <template v-slot:append>
          <q-icon name="swap_vert" class="select-icon pink-icon cursor-pointer"
            @click.stop="$refs['personSelect'].showPopup()" />
        </template>
      </q-select>
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
