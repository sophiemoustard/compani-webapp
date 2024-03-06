<template>
  <q-btn no-caps outline text-color="primary" color="white" :label="label" :icon="icon"
    @click="click" :disable="disable" :loading="loading" class="button" />
</template>

<script>

export default {
  name: 'SecondaryButton',
  props: {
    disable: { type: Boolean, default: false },
    icon: { type: String, default: 'add' },
    label: { type: String, default: '' },
    loading: { type: Boolean, default: false },
  },
  emits: ['click'],
  setup (props, { emit }) {
    const click = (event) => { emit('click', event); };

    return {
      // Methods
      click,
    };
  },
};

</script>
<style lang="sass" scoped>
.button
  justify-self: stretch
  align-self: end
</style>
