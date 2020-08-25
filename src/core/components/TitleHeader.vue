<template functional>
  <div class="row items-start" :class="[data.class, data.staticClass, props.padding && 'title-padding']">
    <div class="col-xs-12 col-md-4 row">
      <h4>
        {{ props.title }}
        <slot name="title" />
      </h4>
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
    padding: { type: Boolean, default: false },
  },
};
</script>
