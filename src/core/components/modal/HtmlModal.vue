<template functional>
  <q-dialog :value="props.value" v-on="listeners" full-height full-width>
    <q-card class="full-height" style="width: 80vw">
      <q-card-section class="row justify-between no-wrap">
        <h5 class="q-ml-md q-mb-xs">{{ props.title }}</h5>
        <q-icon class="cursor-pointer" name="clear" size="1.5rem"  v-close-popup />
      </q-card-section>
      <q-card-section>
        <div v-show="!props.loading" v-html="props.html" class="modal-padding"></div>
      </q-card-section>
      <q-inner-loading :showing="props.loading">
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
}
</script>
