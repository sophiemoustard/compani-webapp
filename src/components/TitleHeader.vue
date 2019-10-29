<template>
  <div class="title-padding row items-start">
    <div class="col-xs-12 col-md-4 row">
      <h4>{{title}}</h4>
      <slot name="title" />
    </div>
    <div class="col-xs-12 col-md-8 row justify-end">
      <slot name="content" />
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: { type: String, default: '' },
  },
}
</script>
