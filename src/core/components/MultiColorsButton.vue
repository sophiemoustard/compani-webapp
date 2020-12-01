<template>
  <div class="button-container">
    <ni-button class="button" flat :icon="icon" color="primary" @click="click" :size="size" />
    <ni-button class="button" flat :label="label" color="black" @click="click" :size="size" />
  </div>
</template>

<script>
import Button from '@components/Button';

export default {
  name: 'MultiColorsButton',
  props: {
    icon: { type: String, default: '' },
    label: { type: String, default: '' },
    size: { type: String, default: 'md' },
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
  .button-container
    align-self: flex-end

  .button
    margin: -4px
    align-self: center

</style>
