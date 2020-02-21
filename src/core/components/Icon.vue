<template>
  <q-icon :class="iconClass" :name="name" :color="color" :size="size" :disable="disable" @click.native="clickHandler" />
</template>

<script>
export default {
  name: 'Ni-Icon',
  props: {
    name: String,
    color: String,
    size: String,
    disable: { type: Boolean, default: false },
  },
  computed: {
    iconClass () {
      return {
        'ni-icon': true,
        'ni-icon-disabled': this.disable,
      }
    },
  },
  methods: {
    clickHandler (e) {
      if (!this.disable) this.$emit('click', e);
    },
  },
}
</script>

<style lang="stylus" scoped>
  .ni-icon
    cursor: pointer
    &-disabled
      opacity: 0.7
      cursor: not-allowed !important
</style>
