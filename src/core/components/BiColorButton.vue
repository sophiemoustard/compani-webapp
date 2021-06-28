<template>
  <div>
    <ni-button class="button" flat :icon="icon" color="primary" @click="click" :size="size" :href="href"
      :disable="disable" :type="type" />
    <ni-button class="button" flat :label="label" color="copper-grey-700" @click="click" :size="size" :href="href"
      :disable="disable" :type="type" />
  </div>
</template>

<script>
import Button from '@components/Button';

export default {
  name: 'BiColorButton',
  props: {
    icon: { type: String, default: '' },
    label: { type: String, default: '' },
    size: { type: String, default: 'md' },
    href: { type: String, default: '' },
    disable: { type: Boolean, default: false },
    type: { type: String, default: '' },
  },
  components: {
    'ni-button': Button,
  },
  methods: {
    click (event) {
      this.$emit('click', event);
    },
  },
};
</script>

<style lang="stylus" scoped>
  .button
    margin: -4px
    align-self: center

</style>
