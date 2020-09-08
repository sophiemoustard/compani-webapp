<template>
  <div class="header">
    <div class="arrow-title q-mb-md items-center">
      <ni-button class="on-left" icon="arrow_back" color="primary" @click.native="$router.go(-1)" />
      <h4>{{ title }}</h4>
    </div>
    <slot name="body" />
  </div>
</template>

<script>
import Button from '@components/Button';

export default {
  name: 'ProfileHeader',
  props: {
    title: { type: String, default: '' },
  },
  components: {
    'ni-button': Button,
  },
};
</script>

<style lang="stylus" scoped>
  .arrow-title
    display: flex
  h4
    margin: 0
</style>
