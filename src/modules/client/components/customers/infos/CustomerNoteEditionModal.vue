<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template slot="title">
      <ni-input in-modal :value="editedNote.title" @input="update($event.trim(), 'title')"
        @blur="validations.title.$touch" :error="validations.title.$error" content-class="bold-title" />
    </template>
    <ni-input in-modal :value="editedNote.description" @input="update($event.trim(), 'description')" type="textarea"
      @blur="validations.description.$touch" :error="validations.description.$error" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Enregistrer et fermer" icon-right="save" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>

import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';

export default {
  name: 'CustomerNoteEditionModal',
  props: {
    value: { type: Boolean, required: true },
    editedNote: { type: Object, required: true },
    validations: { type: Object, required: true },
    loading: { type: Boolean, required: true },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:editedNote', { ...this.editedNote, [prop]: event });
    },
  },
};
</script>

<style lang="stylus" scoped>
  ::v-deep .bold-title>.q-field__inner>.q-field__control>.q-field__control-container>.q-field__native
    color: $copper-grey-900
    font-weight: bold
    font-size: 24px
</style>
