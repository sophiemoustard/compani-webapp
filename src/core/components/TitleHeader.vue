<template>
  <div :class="[$q.screen.lt.md ? 'flex-column' : 'flex-row', 'justify-between', padding && 'title-padding']">
    <div>
      <span class="page-title">{{ title }}</span>
      <slot name="title" />
    </div>
    <slot name="content" />
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
