<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template #title>
      Créer un <span class="text-weight-bold">article</span>
    </template>
    <ni-input in-modal caption="Nom" :value="newBillingItem.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field @input="update($event, 'name')" />
    <ni-select in-modal caption="Type" :value="newBillingItem.type" :error="validations.type.$error"
      @blur="validations.type.$touch" :options="typeOptions" required-field @input="update($event, 'type')" />
    <ni-input in-modal caption="Prix unitaire par défaut TTC" @input="update($event, 'defaultUnitAmount')"
      :value="newBillingItem.defaultUnitAmount" :error="validations.defaultUnitAmount.$error" required-field
      @blur="validations.defaultUnitAmount.$touch" :error-message="defaultUnitAmountError" suffix="€" type="number" />
    <ni-input in-modal caption="TVA" suffix="%" :value="newBillingItem.vat" type="number" @input="update($event, 'vat')"
      :error="validations.vat.$error" @blur="validations.vat.$touch" required-field :error-message="vatError" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer un article" icon-right="add" color="primary"
        :loading="loading" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import Modal from '@components/modal/Modal';

export default {
  name: 'BillingItemCreationModal',
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
  },
  props: {
    validations: { type: Object, required: true },
    value: { type: Boolean, default: false },
    newBillingItem: { type: Object, required: true },
    typeOptions: { type: Array, required: true },
    defaultUnitAmountError: { type: String, required: true },
    vatError: { type: String, required: true },
    loading: { type: Boolean, default: false },
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input () {
      this.$emit('input');
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:newBillingItem', { ...this.newBillingItem, [prop]: event });
    },
  },
};
</script>
