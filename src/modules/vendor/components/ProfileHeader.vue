<template>
  <div class="header">
    <div class="row col-xs-12 q-mb-md items-center">
      <q-icon class="on-left cursor-pointer" size="1rem" name="arrow_back" color="primary"
        @click.native="$router.go(-1)" />
      <h4>{{ title }}</h4>
    </div>
    <slot name="body" />
  </div>
</template>

<script>
export default {
  name: 'ProfileHeader',
  props: {
    title: { type: String, default: '' },
  },
}
</script>

<style lang="stylus" scoped>
  h4
    margin: 0
</style>
