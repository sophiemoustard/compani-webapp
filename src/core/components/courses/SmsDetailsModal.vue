<template>
  <ni-modal :value="value" @hide="hide" @input="input">
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
      <ni-select in-modal caption="Modèle" :options="messageTypeOptions" :value="smsHistory.type" disable />
      <ni-input in-modal caption="Message" :value="smsHistory.message" type="textarea" :rows="7" disable />
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
    value: { type: Boolean, default: false },
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
  methods: {
    formatQuantity,
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
  },
};
</script>
