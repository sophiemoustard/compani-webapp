<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Historique des <span class="text-weight-bold">messages</span>
    </template>
    <div class="q-mb-lg">
      <div v-for="history of smsHistoryList" :key="history._id">
        <ni-banner v-if="history.missingPhones.length" icon="info_outline" custom-class="bg-copper-grey-200">
          <template #message>
            Pour cet envoi, il manquait le numéro de téléphone de
            {{ formatQuantity('stagiaire', history.missingPhones.length) }} :
            {{ getMissingTraineesPhoneHistory(history).join(', ') }}.
          </template>
        </ni-banner>
        <sms-cell :history="history" :message-type-options="messageTypeOptions" @show-details="showDetails"
          :is-expanded="areDetailsVisible[history._id]" />
      </div>
    </div>
  </ni-modal>
</template>

<script>
import { toRefs, ref } from 'vue';
import Banner from '@components/Banner';
import Modal from '@components/modal/Modal';
import SmsCell from '@components/courses/SmsCell';
import { formatQuantity, formatIdentity } from '@helpers/utils';

export default {
  name: 'CourseSmsHistoryModal',
  props: {
    modelValue: { type: Boolean, default: false },
    smsHistoryList: { type: Array, default: () => ([]) },
    messageTypeOptions: { type: Array, default: () => ([]) },
    missingTraineesPhoneHistory: { type: Array, default: () => ([]) },
  },
  components: {
    'ni-modal': Modal,
    'sms-cell': SmsCell,
    'ni-banner': Banner,
  },
  emits: ['hide', 'update:model-value'],
  setup (props, { emit }) {
    const { smsHistoryList } = toRefs(props);
    const areDetailsVisible = ref(Object.fromEntries(smsHistoryList.value.map(history => [history._id, false])));

    const showDetails = (historyId) => { areDetailsVisible.value[historyId] = !areDetailsVisible.value[historyId]; };

    const getMissingTraineesPhoneHistory = history => history.missingPhones
      .map(mp => formatIdentity(mp.identity, 'FL'));

    const hide = () => { emit('hide'); };
    const input = (event) => { emit('update:model-value', event); };

    return {
      // Data
      areDetailsVisible,
      // Methods
      showDetails,
      hide,
      input,
      formatQuantity,
      getMissingTraineesPhoneHistory,
    };
  },
};
</script>
