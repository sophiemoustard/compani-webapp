<template>
  <ni-modal :value="value" @hide="hide">
    <template slot="title">
        Envoyer un <span class="text-weight-bold">message</span>
      </template>
      <ni-select in-modal caption="Modèle" :options="filteredMessageTypeOptions" v-model="localNewSms.type"
        required-field @input="updateType" />
      <ni-input in-modal caption="Message" v-model="localNewSms.body" type="textarea" :rows="7" required-field />
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
    newSms: {
      type: Object,
      validator: p => (typeof p.type === 'string') && (typeof p.body === 'string'),
      default: () => ({ type: '', body: '' }),
    },
    filteredMessageTypeOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-input': Input,
  },
  data () {
    return {
      localNewSms: this.newSms,
    };
  },
  watch: {
    newSms (value) {
      this.localNewSms = value;
    },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    updateType () {
      this.$emit('updateType', this.localNewSms.type);
    },
    send () {
      this.$emit('send', this.localNewSms);
    },
  },
};
</script>
