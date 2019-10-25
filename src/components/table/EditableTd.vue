<template>
  <div class="editable-td">
    <div class="cursor-pointer text-primary" v-show="!props[editionBooleanName]" @click="startEdition">
      {{ value }}
    </div>
    <q-input v-show="props[editionBooleanName]" class="datatable-inner-input" :ref="refName" :value="props[editedField]"
      @input="setEdition" type="number" @blur="disableEdition" bg-color="white" dense
      @keyup.esc="disableEdition" no-parent-field @keyup.enter="disableEdition" borderless />
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
    value: String,
    suffix: String,
  },
  methods: {
    disableEdition () {
      this.$emit('disable', { obj: this.props, path: this.editionBooleanName })
    },
    setEdition (event) {
      this.$emit('change', { value: event, obj: this.props, path: this.editedField })
    },
    startEdition () {
      this.$emit('click', { ref: this.$refs[this.refName], obj: this.props, path: this.editionBooleanName })
    },
  },
}
</script>
