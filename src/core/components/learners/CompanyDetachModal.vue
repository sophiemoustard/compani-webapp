<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Détacher la personne de la <span class="text-weight-bold">structure</span>
    </template>
    <div class="text"> {formatIdentity(userIdentity)} ne fera plus partie de la structure {companyName}</div>
    <ni-date-input in-modal last class="col-xs-12 col-md-6" caption="Détachement à partir du"
      :model-value="detachmentDate" @update:model-value="update" />
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import DateInput from '@components/form/DateInput';
import { DAY } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import CompaniDate from '@helpers/dates/companiDates';

export default {
  name: 'CompanyDetachModal',
  components: {
    'ni-modal': Modal,
    'ni-date-input': DateInput,
  },
  props: {
    modelValue: { type: Boolean, default: false },
    userIdentity: { type: Object, default: () => ({}) },
    companyName: { type: String, default: '' },
    detachmentDate: { type: Date, default: () => CompaniDate().startOf(DAY).toISO() },
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
      formatIdentity,
      hide,
      input,
      update,
      submit,
    };
  },
};
</script>
