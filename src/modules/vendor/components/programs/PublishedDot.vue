<template>
  <div class="dot-container">
    <q-icon v-if="status === PUBLISHED_DOT_WARNING"
      size="12px" name="circle" color="orange-500" />
    <q-icon v-if="isPublished && status === PUBLISHED_DOT_ACTIVE"
      size="12px" name="check_circle" color="green-800" />
    <span v-if="isPublished"
      :class="[{'published-activity-text': status === PUBLISHED_DOT_ACTIVE},
        {'published-activity-text-error': status === PUBLISHED_DOT_WARNING}]">
      Publiée
    </span>
  </div>
</template>

<script>
import { PUBLISHED_DOT_ACTIVE, PUBLISHED_DOT_WARNING } from '@data/constants';

export default {
  name: 'PublishedDot',
  props: {
    status: { type: String, required: true },
    isPublished: { type: Boolean, required: true },
  },
  data () {
    return {
      PUBLISHED_DOT_ACTIVE,
      PUBLISHED_DOT_WARNING,
    };
  },
};
</script>

<style lang="stylus" scoped>
.dot-container
  display: flex
  flex-direction row
  align-items: center
  margin-left: 8px

.published-activity-text
  font-size: 12px
  color: $green-800
  margin-left: 8px
  &-error
    font-size: 12px
    color: $orange-500
    margin-left: 8px
</style>
