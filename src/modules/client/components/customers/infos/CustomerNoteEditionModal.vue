<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      <div class="flex-row">
        <ni-input in-modal :model-value="editedNote.title" @update:model-value="update($event, 'title')"
          @blur="validations.title.$touch" :error="validations.title.$error" @click="removeReadOnly"
          :input-class="['bold-title', { 'cursor-pointer': readOnly }]" :no-border="readOnly" :read-only="readOnly" />
        <div class="cursor-pointer edit-btn">
          <q-icon v-if="readOnly" @click="removeReadOnly" name="edit" data-cy="edit" size="sm" />
        </div>
      </div>
      <div class="lastHistory q-ml-sm">{{ lastHistoryMessage }}</div>
    </template>
    <ni-input in-modal :model-value="editedNote.description" @update:model-value="update($event, 'description')"
      @blur="validations.description.$touch" :error="validations.description.$error" :read-only="readOnly"
      @click="removeReadOnly" :input-class="{ 'cursor-pointer': readOnly }" :no-border="readOnly" type="textarea" />
    <customer-note-history-container v-if="readOnly && get(editedNote, 'histories.length')"
      :histories="editedNote.histories" />
    <template v-if="!readOnly" #footer>
      <q-btn no-caps class="full-width modal-btn" label="Enregistrer et fermer" icon-right="save" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>

import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import get from 'lodash/get';
import { formatDate } from '@helpers/date';
import { formatIdentity } from '@helpers/utils';
import CustomerNoteHistoryContainer from 'src/modules/client/components/customers/infos/CustomerNoteHistoryContainer';

export default {
  name: 'CustomerNoteEditionModal',
  props: {
    modelValue: { type: Boolean, required: true },
    editedNote: { type: Object, required: true },
    validations: { type: Object, required: true },
    loading: { type: Boolean, required: true },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'customer-note-history-container': CustomerNoteHistoryContainer,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:edited-note'],
  data () {
    return {
      readOnly: true,
    };
  },
  computed: {
    lastHistoryMessage () {
      if (!get(this.editedNote, 'histories.length')) return '';

      const lastHistory = this.editedNote.histories[0];
      const name = `${formatIdentity(lastHistory.createdBy.identity, 'FL')}`;

      return `dernière modification le ${formatDate(lastHistory.createdAt)} par ${name}`;
    },
  },
  methods: {
    get,
    formatDate,
    removeReadOnly () {
      this.readOnly = false;
    },
    hide () {
      this.readOnly = true;
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:edited-note', { ...this.editedNote, [prop]: event });
    },
  },
};
</script>

<style lang="sass" scoped>
:deep(.bold-title)
  color: $copper-grey-900
  font-weight: bold
  font-size: 24px

.edit-btn
  display: flex
  margin-top: 2px
  @media screen and (max-width: 420px)
    margin-right: 0.5rem

.lastHistory
  color: $copper-grey-500
  font-size: 14px
</style>
