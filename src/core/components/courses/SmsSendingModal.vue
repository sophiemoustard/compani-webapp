<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
        Envoyer un <span class="text-weight-bold">message</span>
      </template>
      <ni-select in-modal caption="Modèle" :options="filteredMessageTypeOptions" :model-value="newSms.type"
        required-field @update:model-value="updateType($event)" />
      <ni-input in-modal caption="Message" :model-value="newSms.content" @update:model-value="update($event, 'content')"
        type="textarea" :rows="7" required-field />
      <template #footer>
        <ni-button class="bg-primary full-width modal-btn" label="Envoyer message" icon-right="send" color="white"
          :loading="loading" @click="send" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';
import Button from '@components/Button';

export default {
  name: 'SmsSendingModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newSms: {
      type: Object,
      validator: p => (typeof p.type === 'string') && (typeof p.content === 'string'),
      default: () => ({ type: '', content: '' }),
    },
    filteredMessageTypeOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'update-type', 'send', 'update:new-sms'],
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    updateType (event) {
      this.$emit('update-type', event);
      this.update(event, 'type');
    },
    send () {
      this.$emit('send', this.newSms);
    },
    update (event, prop) {
      this.$emit('update:new-sms', { ...this.newSms, [prop]: event });
    },
  },
};
</script>
