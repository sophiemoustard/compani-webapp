<template>
  <q-dialog :model-value="modelValue" @update:model-value="$emit('update:model-value')" @show="$emit('show')"
    @hide="$emit('hide')">
    <div :class="containerClass">
      <div class="modal-padding">
        <div class="row justify-between items-start">
          <div :class="['col-11', !!title && 'text-weight-bold', 'modal-title', 'q-mb-lg']">
            {{ title }}
            <slot name="title" />
          </div>
          <div class="col-1 cursor-pointer modal-btn-close">
            <span>
              <q-icon name="close" v-close-popup data-cy="close-modal" size="sm" />
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
    modelValue: { type: Boolean, default: false },
    containerClass: { type: String, default: () => 'modal-container-sm' },
    title: { type: String, default: '' },
  },
  emits: ['show', 'hide', 'update:model-value'],
};
</script>
