<template>
  <div class="dot-container">
    <div v-if="!shouldHaveMargin" class="dot-margin" />
    <div v-if="status === 'error'" class="dot dot-error" />
    <q-icon v-if="isPublished && status === 'valid'"
      size="12px" name="check_circle" color="accent" />
    <div v-if="shouldHaveMargin" class="text-margin" />
    <span v-if="isPublished"
      :class="[{'published-activity-text': status === 'valid'},
        {'published-activity-text-error': status === 'error'}]">
      Publiée
    </span>
  </div>
</template>

<script>

export default {
  name: 'PublishedDot',
  props: {
    status: { type: String, required: true },
    isPublished: { type: Boolean, required: true },
    shouldHaveMargin: { type: Boolean, required: true },
  },
};
</script>

<style lang="stylus" scoped>
.dot-container
  display: flex
  flex-direction row
  align-items: center
  margin-left: 4px

.dot-margin
  margin: 0 4px 0 0

.text-margin
  margin: 0 0 0 12px

.dot
  margin: 0

.published-activity-text
  font-size: 12px
  color: $accent
  margin-left: 8px
  &-error
    font-size: 12px
    color: $warning
    margin-left: 9px
</style>
