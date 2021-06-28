<template>
  <q-dialog :value="value" v-on="$listeners">
      <div class="modal-container-sm">
        <div class="modal-padding">
          <div class="row items-start">
            <div :class="['col-11', 'q-mb-lg']">
              <ni-input in-modal :value="editedNote.title" @input="update($event, 'title')"
                @blur="validations.title.$touch" :error="validations.title.$error" content-class="bold-title" />
            </div>
            <div class="col-1 cursor-pointer modal-btn-close">
              <span>
                <q-icon name="clear" v-close-popup data-cy="close-modal" />
              </span>
            </div>
          </div>
          <ni-input in-modal :value="editedNote.description" @input="update($event, 'description')" type="textarea"
            @blur="validations.description.$touch" :error="validations.description.$error" />
        </div>
        <q-btn no-caps class="full-width modal-btn" label="Enregistrer et fermer" icon-right="save" color="primary"
          :loading="loading" @click="submit" />
      </div>
    </q-dialog>
</template>

<script>

import Input from '@components/form/Input';

export default {
  name: 'CustomerNoteEditionModal',
  props: {
    value: { type: Boolean, default: false },
    editedNote: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
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
    font-weight bold
</style>
