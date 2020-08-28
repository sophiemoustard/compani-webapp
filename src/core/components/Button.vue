<template>
  <q-btn flat small :color="color" :icon="icon" :disable="disable" :type="type" :href="!disable && href"
    :target="type === 'a' ? '_blank': ''" :label="label" :dense="dense" :no-caps="!!label"
    :loading="loading" @click.stop.native="click" :size="size" />
</template>

<script>
export default {
  name: 'Banner',
  props: {
    color: { type: String, default: 'grey' },
    dense: { type: Boolean, default: true },
    disable: { type: Boolean, default: false },
    href: { type: String, default: '' },
    icon: { type: String, default: '' },
    label: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    size: { type: String, default: 'md' }, // determine the font-size for label, icon is 1.715em of that
    target: { type: String, default: '' },
    type: { type: String, default: '' },
  },
  methods: {
    click (event) {
      this.$emit('click', event);
    },
  },
};
</script>
