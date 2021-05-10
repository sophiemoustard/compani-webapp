<template>
  <div class="row justify-between signup-header-padding bg-white items-center col-12">
    <img style="height: 30px" :src="PINK_LOGO" alt="Logo Compani">
    <p class="no-margin" style="font-size: 0.8rem; text-align: right">Espace Alenvi</p>
  </div>
</template>

<script>
import { PINK_LOGO } from '@data/constants';

export default {
  name: 'CompaniHeader',
  data () {
    return {
      PINK_LOGO,
    };
  },
};
</script>

<style lang="stylus" scoped>
  .signup-header-padding
      padding: 24px 16px
</style>
