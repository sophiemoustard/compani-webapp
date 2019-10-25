<template>
  <q-dialog :value="value" @input="$emit('input', $event)" @hide="$emit('hide', $event)">
    <div class="modal-container" :class="containerClass">
      <div class="modal-padding">
        <div class="row justify-between items-baseline">
          <div class="col-11">
            <h5 :class="{ 'text-weight-bold': !!title }">{{ title }}<slot name="title" /></h5>
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="clear" v-close-popup />
            </span>
          </div>
        </div>
        <slot />
      </div>
      <slot name="footer" />
    </div>
  </q-dialog>
</template>

<script>
export default {
  name: 'Modal',
  props: {
    value: { type: Boolean, default: false },
    containerClass: { type: String, default: () => 'modal-container-sm' },
    title: { type: String, default: '' },
  },
}
</script>
