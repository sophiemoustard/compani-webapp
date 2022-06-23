<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Historique des <span class="text-weight-bold">messages</span>
    </template>
    <div v-for="history of smsHistoryList" :key="history._id">
      <sms-cell :history="history" :message-type-options="messageTypeOptions" @show-details="showDetails"
        :is-expand="areDetailsVisible[history._id]" />
    </div>
  </ni-modal>
</template>

<script>
import { toRefs, ref } from 'vue';
import Modal from '@components/modal/Modal';
import SmsCell from '@components/courses/SmsCell';
import { formatPrice } from '@helpers/utils';

export default {
  name: 'CourseCreditNoteCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    smsHistoryList: { type: Array, default: () => ([]) },
    messageTypeOptions: { type: Array, default: () => ([]) },
  },
  components: {
    'ni-modal': Modal,
    'sms-cell': SmsCell,
  },
  emits: ['hide', 'update:model-value'],
  setup (props, { emit }) {
    const { smsHistoryList } = toRefs(props);
    const areDetailsVisible = ref(Object.fromEntries(smsHistoryList.value.map(history => [history._id, false])));

    const showDetails = (historyId) => { areDetailsVisible.value[historyId] = !areDetailsVisible.value[historyId]; };

    const hide = () => { emit('hide'); };
    const input = (event) => { emit('update:model-value', event); };

    return {
      // Data
      areDetailsVisible,
      // Methods
      showDetails,
      hide,
      input,
      formatPrice,
    };
  },
};
</script>
