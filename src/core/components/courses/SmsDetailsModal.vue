<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
        Message envoyé le <span class="text-weight-bold">{{ smsDate }}</span>
      </template>
      <ni-banner v-if="missingTraineesPhoneHistory.length" icon="info_outline">
        <template #message>
          Pour cet envoi, il manquait le numéro de téléphone de
          {{ formatQuantity('stagiaire', missingTraineesPhoneHistory.length) }} :
          {{ missingTraineesPhoneHistory.join(', ') }}.
        </template>
      </ni-banner>
      <ni-select in-modal caption="Modèle" :options="messageTypeOptions" :model-value="smsHistory.type" disable />
      <ni-input in-modal caption="Message" :model-value="smsHistory.message" type="textarea" :rows="7" disable />
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import Banner from '@components/Banner';
import { formatQuantity } from '@helpers/utils';
import { formatDate } from '@helpers/date';

export default {
  name: 'SmsDetailsModal',
  props: {
    modelValue: { type: Boolean, default: false },
    missingTraineesPhoneHistory: { type: Array, default: () => [] },
    messageTypeOptions: { type: Array, default: () => [] },
    smsHistory: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
    'ni-banner': Banner,
  },
  computed: {
    smsDate () {
      return formatDate(this.smsHistory.date);
    },
  },
  emits: ['hide', 'update:model-value'],
  methods: {
    formatQuantity,
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
  },
};
</script>
