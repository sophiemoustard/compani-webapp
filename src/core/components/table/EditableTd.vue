<template>
  <div class="editable-td">
    <div class="cursor-pointer text-primary" v-show="!props[editionBooleanName]" @click="startEdition">
      {{ value }}
    </div>
    <q-input v-show="props[editionBooleanName]" :ref="refName" :value="props[editedField]"
      @change.native="setEdition" type="number" @blur="disableEdition" bg-color="white" dense
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
  methods: {
    disableEdition () {
      this.$emit('disable', { obj: this.props, path: this.editionBooleanName });
    },
    setEdition (event) {
      this.$emit(
        'change',
        { value: Number.parseFloat(event.target.value, 10), obj: this.props, path: this.editedField }
      );
    },
    startEdition () {
      this.$emit('click', { ref: this.$refs[this.refName], obj: this.props, path: this.editionBooleanName });
    },
  },
};
</script>

<style lang="sass" scoped>
  .editable-td
    & ::v-deep .q-field
      &__control
        height: 30px
        min-width: 60px
        padding: 0 4px
      &__suffix
        line-height: 20px
</style>
