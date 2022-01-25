<template>
  <div :class="['dot-container', containerClass]">
    <q-icon v-if="status === PUBLISHED_DOT_WARNING" size="12px" name="circle" />
    <q-icon v-if="isPublished && status === PUBLISHED_DOT_ACTIVE" size="12px" name="check_circle" />
    <span v-if="isPublished" class="activity-text">
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
  computed: {
    containerClass () {
      if (this.status === PUBLISHED_DOT_ACTIVE) return 'info-active';
      if (this.status === PUBLISHED_DOT_WARNING) return 'info-warning';
      return '';
    },
  },
};
</script>

<style lang="sass" scoped>
.dot-container
  display: flex
  flex-direction: row
  align-items: center
  margin-left: 8px

.activity-text
  font-size: 12px
  margin-left: 8px
</style>
