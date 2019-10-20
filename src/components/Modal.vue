<template>
  <q-dialog ref="modal" :value="value" @input="$emit('input', $event)" @hide="$emit('hide', $event)"
    :content-classes="contentClasses">
    <div class="modal-padding">
      <div class="row justify-between items-baseline">
        <div class="col-11">
          <h5 :class="{ 'text-weight-bold': !!title }">{{ title }}<slot name="title" /></h5>
        </div>
        <div class="col-1 cursor-pointer modal-btn-close">
          <span>
            <q-icon name="clear" @click.native="$refs.modal.hide()" />
          </span>
        </div>
      </div>
      <slot />
    </div>
    <slot name="footer" />
  </q-dialog>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    value: { type: Boolean, default: false },
    contentClasses: { type: String, default: () => 'modal-container-sm' },
    title: { type: String, default: '' },
  },
  methods: {
    close () {
      this.$emit('input', false);
    },
  },
}
</script>
