<template>
  <div class="flex-row items-center">
    <ni-button class="button" :icon="icon" :color="iconColor" @click="click" :size="size" :href="href"
      :disable="disable" :type="type" />
    <ni-button class="button" :label="label" :color="labelColor" @click="click" :size="size" :href="href"
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
    labelColor: { type: String, default: 'copper-grey-700' },
    iconColor: { type: String, default: 'primary' },
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

<style lang="sass" scoped>
.button
  margin: -4px
  align-self: center
</style>
