<template>
  <ni-modal :value="value" @input="$emit('input', $event)" @hide="resetVersionEditionModal">
    <template slot="title">
      Modifier le <span class="text-weight-bold">contrat</span>
    </template>
    <ni-input in-modal caption="Taux horaire"  type="number" suffix="€" required-field
      v-model="editedVersion.grossHourlyRate" :error="validations.grossHourlyRate.$error"
      @blur="validations.grossHourlyRate.$touch" />
    <ni-date-input caption="Date d'effet" v-model="editedVersion.startDate" :min="minStartDate"
      in-modal required-field @blur="validations.startDate.$touch" :error="validations.startDate.$error" />
    <div class="margin-input last">
      <q-checkbox dense v-model="editedVersion.shouldBeSigned" label="Signature en ligne" />
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Modifier le contrat" icon-right="add" color="primary"
        :loading="loading" @click="editVersion" :disable="!isVersionUpdated" />
    </template>
  </ni-modal>
</template>

<script>
import Input from '@components/form/Input';
import DateInput from '@components/form/DateInput';
import Modal from '@components/modal/Modal';

export default {
  name: 'VersionEditionModal',
  props: {
    value: { type: Boolean, default: false },
    editedVersion: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    minStartDate: { type: String, default: '' },
    versionTemplate: { type: String, default: '' },
    isVersionUpdated: { type: Boolean, default: false },
    loading: {type: Boolean, default: false},
  },
  components: {
    'ni-input': Input,
    'ni-date-input': DateInput,
    'ni-modal': Modal,
  },
  methods: {
    editVersion () {
      this.$emit('editVersion');
    },
    resetVersionEditionModal () {
      this.$emit('hide');
    },
  },
}
</script>
