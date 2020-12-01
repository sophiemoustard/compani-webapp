<template>
  <div class="button-container">
    <ni-button class="button" flat :icon="icon" color="primary" @click="click" :size="size"
      v-clipboard:copy="valueToCopy" v-clipboard:success="handleCopySuccess" />
    <ni-button class="button" flat :label="label" color="black" @click="click" :size="size"
      v-clipboard:copy="valueToCopy" v-clipboard:success="handleCopySuccess" />
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
    valueToCopy: { type: String, default: '' },
  },
  components: {
    'ni-button': Button,
  },
  methods: {
    click (event) {
      this.$emit('click', event);
    },
    handleCopySuccess () {
      this.$emit('handle-copy-success');
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
