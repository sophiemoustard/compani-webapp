<template>
  <q-btn :flat="flat" small no-caps :color="color" :icon="icon" :disable="disable" :type="type" :href="!disable && href"
    :target="target" :label="label" :dense="!label" :loading="loading" :size="size" unelevated
    @click.stop.native="click" />
</template>

<script>
export default {
  name: 'Button',
  props: {
    color: { type: String, default: 'grey' },
    disable: { type: Boolean, default: false },
    flat: { type: Boolean, default: true },
    href: { type: String, default: '' },
    icon: { type: String, default: undefined },
    label: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    size: { type: String, default: 'md' }, // determine the font-size for label, icon is 1.715em of that
    type: { type: String, default: '' },
    unelevated: { type: Boolean, default: false },
  },
  computed: {
    target () {
      return this.type === 'a' ? '_blank' : '';
    },
  },
  methods: {
    click (event) {
      this.$emit('click', event);
    },
  },
};
</script>
