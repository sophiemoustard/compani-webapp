<template>
  <q-btn flat small no-caps :color="color" :icon="icon" :disable="disable" :type="type" :href="!disable && href"
    :target="target" :label="label" :dense="!label" :loading="loading" :size="size"
    @click.stop.native="click" />
</template>

<script>
export default {
  name: 'Button',
  props: {
    color: { type: String, default: 'grey' },
    disable: { type: Boolean, default: false },
    href: { type: String, default: '' },
    icon: { type: String, default: '' },
    label: { type: String, default: '' },
    loading: { type: Boolean, default: false },
    size: { type: String, default: 'md' }, // determine the font-size for label, icon is 1.715em of that
    type: { type: String, default: '' },
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
