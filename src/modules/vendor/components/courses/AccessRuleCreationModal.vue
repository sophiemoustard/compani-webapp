<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Ajouter une <span class="text-weight-bold">règle d'accès</span>
    </template>
    <ni-select in-modal v-model="newAccessRule" :error="validations.$error" required-field
      caption="Structure" :options="companyOptions" />
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Ajouter la règle d'accès" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';

export default {
  name: 'AccessRuleCreationModal',
  props: {
    value: { type: Boolean, default: false }, // warn vue : avoid mutating a prop directly
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    companyOptions: { type: Array, default: () => [] },
  },
  data () {
    return {
      newAccessRule: '',
    };
  },
  components: {
    'ni-select': Select,
    'ni-modal': Modal,
  },
  methods: {
    hide () {
      this.newAccessRule = '';
      this.$emit('hide');
    },
    input (event) {
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit', this.newAccessRule);
    },
  },
};
</script>
