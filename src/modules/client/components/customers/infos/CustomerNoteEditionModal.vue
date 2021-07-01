<template>
  <q-dialog :value="value" @hide="hide" @input="input">
    <div class="modal-container-md">
      <div class="modal-padding">
        <div class="row justify-between items-start">
          <div class="flex-1 text-weight-bold modal-title q-mb-lg">
            <ni-input in-modal :value="editedNote.title" @input="update($event.trim(), 'title')" :read-only="readOnly"
              @blur="validations.title.$touch" :error="validations.title.$error" content-class="bold-title"
              @click="readOnly = false" />
          </div>
          <div class="cursor-pointer modal-btn-close">
            <q-icon v-if="readOnly" @click="readOnly = false" name="edit" data-cy="edit" />
            <q-icon name="clear" v-close-popup data-cy="close-modal" class="close-btn" />
          </div>
        </div>
        <ni-input in-modal :value="editedNote.description" @input="update($event.trim(), 'description')" type="textarea"
          @blur="validations.description.$touch" :error="validations.description.$error" :read-only="readOnly"
          @click="readOnly = false" />
      </div>
      <div v-if="!readOnly">
        <q-btn no-caps class="full-width modal-btn" label="Enregistrer et fermer" icon-right="save" color="primary"
          :loading="loading" @click="submit" />
      </div>
    </div>
  </q-dialog>
</template>

<script>

import Input from '@components/form/Input';

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
  },
  data () {
    return {
      readOnly: true,
    };
  },
  methods: {
    hide () {
      this.readOnly = true;
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

.close-btn
  margin-left: 0.8rem
</style>
