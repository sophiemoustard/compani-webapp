<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template #title>
        Envoyer un <span class="text-weight-bold">message</span>
      </template>
      <ni-select in-modal caption="Modèle" :options="filteredMessageTypeOptions" :value="newSms.type"
        required-field @input="updateType($event)" />
      <ni-input in-modal caption="Message" :value="newSms.content" @input="update($event, 'content')" type="textarea"
        :rows="7" required-field />
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Envoyer message" icon-right="send" color="primary"
          :loading="loading" @click="send" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Input from '@components/form/Input';

export default {
  name: 'SmsSendingModal',
  props: {
    value: { type: Boolean, default: false },
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
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    updateType (event) {
      this.$emit('update-type', event);
      this.update(event, 'type');
    },
    send () {
      this.$emit('send', this.newSms);
    },
    update (event, prop) {
      this.$emit('update:newSms', { ...this.newSms, [prop]: event });
    },
  },
};
</script>
