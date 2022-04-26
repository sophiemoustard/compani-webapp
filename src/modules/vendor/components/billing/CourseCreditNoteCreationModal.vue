<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Créer un <span class="text-weight-bold">avoir</span>
    </template>
    <div>
      Cet avoir annule la facture
      <span class="text-weight-bold">
          {{ creditNoteMetaInfo.number }} - {{ formatPrice(creditNoteMetaInfo.netInclTaxes) }}
      </span>
    </div>
    <div class="name">{{ creditNoteMetaInfo.courseName }}</div>
    <ni-date-input in-modal caption="Date" :model-value="newCreditNote.date" @blur="validations.date.$touch"
      required-field :error="validations.date.$error" @update:model-value="update($event, 'date')" :min="minDate"
      :error-message="dateErrorMessage(validations)" />
    <ni-input in-modal caption="Motif" :model-value="newCreditNote.misc" @update:model-value="update($event, 'misc')"
      type="textarea" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Créer l'avoir" icon-right="add" color="white"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Button from '@components/Button';
import DateInput from '@components/form/DateInput';
import { REQUIRED_LABEL } from '@data/constants';
import { formatPrice } from '@helpers/utils';

export default {
  name: 'CourseCreditNoteCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newCreditNote: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    minDate: { type: String, required: true },
    creditNoteMetaInfo: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-input': Input,
    'ni-button': Button,
    'ni-date-input': DateInput,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-credit-note'],
  setup (props, { emit }) {
    const dateErrorMessage = (validations) => {
      if (!validations.date.required.$response) return REQUIRED_LABEL;
      if (!validations.date.minDate.$response) {
        return 'La date de l\'avoir ne peut être antérieure à la date de facturation';
      }
    };
    const hide = () => { emit('hide'); };
    const input = (event) => { emit('update:model-value', event); };
    const submit = () => { emit('submit'); };
    const update = (event, path) => {
      emit('update:new-credit-note', set({ ...props.newCreditNote }, path, event));
    };

    return {
      // Methods
      dateErrorMessage,
      hide,
      input,
      submit,
      update,
      formatPrice,
    };
  },
};
</script>

<style lang="sass" scoped>
.name
  color: $copper-grey-500
  font-size: 14px
  margin-bottom: 16px
</style>
