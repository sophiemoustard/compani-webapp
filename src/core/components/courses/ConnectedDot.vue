<template>
  <div class="dot-container">
    <q-icon size="12px" name="check_circle" color="green-600" />
    <span :class="'connected-text'">Connecté</span>
  </div>
</template>

<script>

export default {
  name: 'PublishedDot',
};
</script>

<style lang="sass" scoped>
.dot-container
  display: flex
  flex-direction row
  align-items: center
  justify-content: center

.connected-text
  font-size: 12px
  color: $green-600
</style>
