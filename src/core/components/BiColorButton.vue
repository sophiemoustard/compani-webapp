<template>
  <div>
    <ni-button class="button" flat :icon="icon" color="primary" @click="click" :size="size" />
    <ni-button class="button" flat :label="label" color="black" @click="click" :size="size" />
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
