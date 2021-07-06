<template>
  <ni-modal :value="value" @hide="hide" @input="input" container-class="modal-container-md">
    <template slot="title">
      <div class="flex-row">
        <ni-input in-modal :value="editedNote.title" @input="update($event, 'title')" :read-only="readOnly"
          @blur="validations.title.$touch" :error="validations.title.$error" @click="removeReadOnly"
          :input-class="['bold-title', { 'cursor-pointer': readOnly }]" />
        <div class="cursor-pointer edit-btn">
          <q-icon v-if="readOnly" @click="removeReadOnly" name="edit" data-cy="edit" size="sm" />
        </div>
      </div>
    </template>
    <ni-input in-modal :value="editedNote.description" @input="update($event, 'description')" type="textarea"
      @blur="validations.description.$touch" :error="validations.description.$error" :read-only="readOnly"
      @click="removeReadOnly" :input-class="{ 'cursor-pointer': readOnly }" />
    <template v-if="!readOnly" slot="footer">
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
  data () {
    return {
      readOnly: true,
    };
  },
  methods: {
    removeReadOnly () {
      this.readOnly = false;
    },
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
  ::v-deep .bold-title
    color: $copper-grey-900
    font-weight: bold
    font-size: 24px

.edit-btn
  display: flex
  margin-top: 2px
  @media screen and (max-width: 420px)
    margin-right: 0.5rem
</style>
