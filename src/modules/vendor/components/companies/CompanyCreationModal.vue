<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer une nouvelle <span class="text-weight-bold">structure</span>
    </template>
    <ni-input in-modal :model-value="newCompany.name" @update:model-value="update($event.trim(), 'name')"
      @blur="validations.name.$touch" required-field caption="Raison sociale" :error="validations.name.$error" />
    <ni-select in-modal caption="Chargé(e) d'accompagnement" :model-value="newCompany.salesRepresentative"
      @update:model-value="update($event, 'salesRepresentative')" :options="salesRepresentativeOptions" clearable />
    <ni-select in-modal caption="Société mère" :model-value="newCompany.holding" :options="holdingOptions" clearable
      @update:model-value="update($event, 'holding')" :disable="disableHolding" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer la structure" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs, ref } from 'vue';
import Holdings from '@api/Holdings';
import Users from '@api/Users';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { formatAndSortUserOptions, formatAndSortOptions } from '@helpers/utils';
import { TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN } from '@data/constants';

export default {
  name: 'CompanyCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    newCompany: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    disableHolding: { type: Boolean, default: false },
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-company'],
  setup (props, { emit }) {
    const { newCompany } = toRefs(props);
    const salesRepresentativeOptions = ref([]);
    const holdingOptions = ref([]);

    const hide = () => emit('hide');

    const input = event => emit('update:model-value', event);

    const submit = () => emit('submit');

    const update = (event, prop) => {
      emit('update:new-company', { ...newCompany.value, [prop]: event });
    };

    const refreshSalesRepresentativeOptions = async () => {
      const rofAndAdminUsers = await Users.list({ role: [TRAINING_ORGANISATION_MANAGER, VENDOR_ADMIN] });

      salesRepresentativeOptions.value = formatAndSortUserOptions(rofAndAdminUsers, false);
    };

    const refreshHoldings = async () => {
      try {
        const holdings = await Holdings.list();
        holdingOptions.value = formatAndSortOptions(holdings, 'name');
      } catch (e) {
        console.error(e);
        holdingOptions.value = [];
      }
    };

    const created = async () => Promise.all([refreshSalesRepresentativeOptions(), refreshHoldings()]);

    created();

    return {
      // Data
      salesRepresentativeOptions,
      holdingOptions,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
