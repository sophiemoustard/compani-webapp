<template>
  <q-dialog :value="value" v-on="$listeners" full-height full-width>
    <q-card class="full-height" style="width: 80vw">
      <q-card-section class="row justify-between no-wrap title-modal">
        <div class="q-ml-md q-mb-xs modal-title">{{ title }}</div>
        <q-icon class="cursor-pointer" name="close" size="1.5rem" v-close-popup />
      </q-card-section>
      <q-card-section>
        <div v-show="!loading" v-html="html" class="modal-padding" />
      </q-card-section>
      <q-inner-loading :showing="loading">
        <q-spinner-facebook size="30px" color="primary" />
      </q-inner-loading>
    </q-card>
  </q-dialog>
</template>

<script>
export default {
  name: 'HtmlModal',
  props: {
    value: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    title: { type: String, default: '' },
    html: { type: String, default: '' },
  },
};
</script>

<style lang="sass" scoped>
.title-modal
  position: sticky
  top: 0px
  z-index: 1
  background-color: white
</style>
