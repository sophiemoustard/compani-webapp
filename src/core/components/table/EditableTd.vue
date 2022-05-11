<template>
  <div class="editable-td">
    <div class="cursor-pointer text-primary" v-show="!props[editionBooleanName]" @click="startEdition">
      {{ value }}
    </div>
    <q-input v-show="props[editionBooleanName]" :ref="refName" :model-value="props[editedField]"
      @update:model-value="setEdition" type="number" @blur="disableEdition" bg-color="white" dense
      @keyup.esc="disableEdition" no-parent-field @keyup.enter="disableEdition" borderless :suffix="suffix" />
  </div>
</template>

<script>
export default {
  name: 'EditableTd',
  props: {
    props: { type: Object, default: () => ({}) },
    editedField: { type: String, default: '' },
    editionBooleanName: { type: String, default: '' },
    refName: { type: String, default: '' },
    value: { type: String, default: '' },
    suffix: { type: String, default: '' },
  },
  emits: ['disable', 'change', 'click'],
  methods: {
    disableEdition () {
      this.$emit('disable', { obj: this.props, path: this.editionBooleanName });
    },
    setEdition (event) {
      this.$emit('change', { value: Number.parseFloat(event, 10), obj: this.props, path: this.editedField });
    },
    startEdition () {
      this.$emit('click', { ref: this.$refs[this.refName], obj: this.props, path: this.editionBooleanName });
    },
  },
};
</script>

<style lang="sass" scoped>
.editable-td
  & :deep(.q-field)
    :deep(.q-field__control)
      height: 30px
      min-width: 60px
      padding: 0 4px
    :deep(.q-field__suffix)
      line-height: 20px
</style>
