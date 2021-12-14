<template>
  <div class="row justify-between signup-header-padding bg-white items-center col-12">
    <img style="height: 30px" :src="BLUE_TEXT_LOGO" alt="Logo Compani">
  </div>
</template>

<script>
import { BLUE_TEXT_LOGO } from '@data/constants';

export default {
  name: 'CompaniHeader',
  data () {
    return {
      BLUE_TEXT_LOGO,
    };
  },
};
</script>

<style lang="stylus" scoped>
  .signup-header-padding
      padding: 24px 16px
</style>
