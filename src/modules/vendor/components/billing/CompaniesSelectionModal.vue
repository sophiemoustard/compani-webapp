<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Ajouter des <span class="text-weight-bold">structures</span>
    </template>
    <div class="q-mb-md">{{ courseName }} </div>
    <ni-option-group :model-value="companiesToBill" :error-message="REQUIRED_LABEL" required-field
      :options="companiesOptions" :error="validations.$error" type="checkbox"
      caption="Sélectionner les structures à facturer" @update:model-value="update($event)" />
    <template #footer>
      <ni-button class="full-width modal-btn bg-primary" label="Ajouter les structures" icon-right="add" color="white"
        @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs, computed } from 'vue';
import Modal from '@components/modal/Modal';
import OptionGroup from '@components/form/OptionGroup';
import Button from '@components/Button';
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'CompaniesSelectionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    companiesToBill: { type: Array, default: () => [] },
    courseCompanies: { type: Array, default: () => [] },
    validations: { type: Object, default: () => ({}) },
    courseName: { type: String, default: '' },
    isInterCourse: { type: Boolean, default: false },

  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-option-group': OptionGroup,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:companies-to-bill'],
  setup (props, { emit }) {
    const { courseCompanies, isInterCourse } = toRefs(props);

    const companiesOptions = computed(() => courseCompanies.value
      .map((c) => {
        const label = isInterCourse.value ? `${c.name}${c.holding ? ` (${c.holding.name})` : ''}` : c.name;
        return { label, value: c._id };
      }));

    const hide = () => emit('hide');

    const input = event => emit('update:model-value', event);

    const submit = () => emit('submit');

    const update = (event) => { emit('update:companies-to-bill', event); };

    return {
      // Data
      REQUIRED_LABEL,
      // Computed
      companiesOptions,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
