<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Détacher la personne de la <span class="text-weight-bold">structure</span>
    </template>
    <div class="text q-mb-md">
      {{ userIdentity }} ne fera plus partie de la structure {{ companyName }} à partir de la date renseignée
      ci-dessous.
    </div>
    <ni-date-input in-modal last required-field class="col-xs-12 col-md-6" caption="Détachement à partir du"
      :model-value="detachmentDate" @update:model-value="update" :min="minDetachmentDate" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Détacher la personne" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import DateInput from '@components/form/DateInput';
import { DAY } from '@data/constants';
import CompaniDate from '@helpers/dates/companiDates';

export default {
  name: 'CompanyDetachModal',
  components: {
    'ni-modal': Modal,
    'ni-date-input': DateInput,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    userIdentity: { type: String, default: '' },
    companyName: { type: String, default: '' },
    detachmentDate: { type: String, default: CompaniDate().endOf(DAY).toISO() },
    loading: { type: Boolean, default: false },
    minDetachmentDate: { type: String, default: '' },
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:detachmentDate'],
  setup (_, { emit }) {
    const hide = () => emit('hide');
    const input = (event) => { emit('update:model-value', event); };

    const update = (value) => { emit('update:detachmentDate', value); };

    const submit = () => emit('submit');

    return {
      // Data
      // Methods
      hide,
      input,
      update,
      submit,
    };
  },
};
</script>
