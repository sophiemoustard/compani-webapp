<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
       Modifier <span class="text-weight-bold">les certifications</span>
    </template>
    <div class="text-copper-grey-600">
      Les apprenants sélectionnés passeront la certification
    </div>
      <ni-option-group in-modal :model-value="certifiedTrainees" @update:model-value="update" type="checkbox"
        :options="traineeOptions" />
      <template #footer>
        <ni-button class="bg-primary full-width modal-btn" label="Modifier les certifications" icon-right="edit"
          color="white" :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import OptionGroup from '@components/form/OptionGroup';
import Button from '@components/Button';

export default {
  name: 'CertificationsUpdateModal',
  props: {
    modelValue: { type: Boolean, default: false },
    certifiedTrainees: { type: Array, default: () => [] },
    traineeOptions: { type: Array, default: () => [] },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-button': Button,
    'ni-option-group': OptionGroup,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:certified-trainees'],
  setup (_, { emit }) {
    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = event => emit('update:certified-trainees', event);

    return {
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
