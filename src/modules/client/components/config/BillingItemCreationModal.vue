<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
      Créer un <span class="text-weight-bold">article</span>
    </template>
    <ni-input in-modal caption="Nom" :model-value="newBillingItem.name" :error="validations.name.$error"
      @blur="validations.name.$touch" required-field @update:model-value="update($event.trim(), 'name')" />
    <ni-select in-modal caption="Type" :model-value="newBillingItem.type" :error="validations.type.$error"
      @blur="validations.type.$touch" :options="typeOptions" @update:model-value="update($event, 'type')"
      required-field />
    <ni-input in-modal caption="Prix unitaire par défaut TTC" @update:model-value="update($event, 'defaultUnitAmount')"
      :model-value="newBillingItem.defaultUnitAmount" :error="validations.defaultUnitAmount.$error" required-field
      @blur="validations.defaultUnitAmount.$touch" :error-message="defaultUnitAmountError" suffix="€" type="number" />
    <ni-input in-modal caption="TVA" :model-value="newBillingItem.vat" @update:model-value="update($event, 'vat')"
      :error="validations.vat.$error" @blur="validations.vat.$touch" required-field :error-message="vatError"
      type="number" suffix="%" />
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
    modelValue: { type: Boolean, default: false },
    newBillingItem: { type: Object, required: true },
    typeOptions: { type: Array, required: true },
    defaultUnitAmountError: { type: String, required: true },
    vatError: { type: String, required: true },
    loading: { type: Boolean, default: false },
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-billing-item'],
  methods: {
    hide () {
      this.$emit('hide');
    },
    input () {
      this.$emit('update:model-value');
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:new-billing-item', { ...this.newBillingItem, [prop]: event });
    },
  },
};
</script>
