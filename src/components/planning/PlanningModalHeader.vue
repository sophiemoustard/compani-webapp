<template>
  <div class="row q-mb-md">
    <div class="col-11 person-name">
      <img :src="avatar" class="avatar">
      <div class="person-name-text" v-if="options.length === 0">{{ formattedIdentity }}</div>
      <div v-else :class="{ 'col-md-6': $q.platform.is.desktop }" class="person-name-select">
        <ni-select :value="value" :options="options" @input="input" no-error icon="swap_vert" />
      </div>
    </div>
    <div class="col-1 cursor-pointer modal-btn-close">
      <span><q-icon name="clear" @click.native="$emit('close')" /></span>
    </div>
  </div>
</template>

<script>
import { UNKNOWN_AVATAR, DEFAULT_AVATAR } from '../../data/constants';
import { formatIdentity } from '../../helpers/utils';
import Select from '../form/Select';

export default {
  name: 'PlanningModalHeader',
  props: {
    value: { type: String },
    options: { type: Array, default: () => [] },
    selectedPerson: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-select': Select,
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
  methods: {
    input ($event) {
      if (!$event) this.$emit('update:sector', this.value);
      this.$emit('input', $event)
    },
  },
}
</script>
