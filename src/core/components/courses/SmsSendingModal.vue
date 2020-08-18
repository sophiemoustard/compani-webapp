<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
        Envoyer un <span class="text-weight-bold">message</span>
      </template>
      <ni-select in-modal caption="Modèle" :options="filteredMessageTypeOptions" v-model="sendingMessageType"
        required-field @input="updateType" />
      <ni-input in-modal caption="Message" v-model="sendingMessage" type="textarea" :rows="7" required-field />
      <template slot="footer">
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
    messageType: { type: String, default: () => '' },
    filteredMessageTypeOptions: { type: Array, default: () => [] },
    message: { type: String, default: () => '' },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
  },
  data () {
    return {
      sendingMessage: this.message,
      sendingMessageType: this.messageType,
    };
  },
  watch: {
    message () {
      this.sendingMessage = this.message;
    },
    messageType () {
      this.sendingMessageType = this.messageType;
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    updateType () {
      this.$emit('updateType', this.sendingMessageType);
    },
    send () {
      this.$emit('send', this.sendingMessage, this.sendingMessageType);
    },
  },
};
</script>
