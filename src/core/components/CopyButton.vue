<template>
  <div class="button-container">
    <ni-button class="button" flat :icon="icon" color="primary" :size="size"
      v-clipboard:copy="valueToCopy" v-clipboard:success="copySuccess" />
    <ni-button class="button" flat :label="label" color="copper-grey-700" :size="size"
      v-clipboard:copy="valueToCopy" v-clipboard:success="copySuccess" />
  </div>
</template>

<script>
import Button from '@components/Button';

export default {
  name: 'CopyButton',
  props: {
    icon: { type: String, default: '' },
    label: { type: String, default: '' },
    size: { type: String, default: 'md' },
    valueToCopy: { type: String, default: '' },
  },
  components: {
    'ni-button': Button,
  },
  emits: ['copy-success'],
  methods: {
    copySuccess () {
      this.$emit('copy-success');
    },
  },
};
</script>

<style lang="sass" scoped>
.button
  margin: -4px
  align-self: center
</style>
