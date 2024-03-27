<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer un nouveau <span class="text-weight-bold">questionnaire</span>
    </template>
    <ni-input in-modal :model-value="newQuestionnaire.name" @update:model-value="update($event.trim(), 'name')"
      :error="validations.name.$error" @blur="validations.name.$touch" required-field caption="Nom" />
    <ni-select in-modal :model-value="newQuestionnaire.type" @update:model-value="update($event, 'type')"
      :options="typeOptions" :error="validations.type.$error" @blur="validations.type.$touch" required-field
      caption="Type" :disable="!!programId" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer le questionnaire" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { toRefs } from 'vue';
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { QUESTIONNAIRE_TYPES, SELF_POSITIONNING } from '@data/constants';

export default {
  name: 'QuestionnaireCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    newQuestionnaire: { type: Object, default: () => ({}) },
    programId: { type: String, default: '' },
  },
  emits: ['hide', 'update:model-value', 'update:new-questionnaire', 'submit'],
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
  },
  setup (props, { emit }) {
    const { newQuestionnaire, programId } = toRefs(props);

    const typeOptions = programId.value
      ? [{ label: QUESTIONNAIRE_TYPES[SELF_POSITIONNING], value: SELF_POSITIONNING }]
      : Object.keys(QUESTIONNAIRE_TYPES)
        .filter(type => type !== SELF_POSITIONNING)
        .map(type => ({ label: QUESTIONNAIRE_TYPES[type], value: type }));

    const hide = () => emit('hide');

    const input = event => emit('update:model-value', event);

    const submit = () => emit('submit');

    const update = (event, prop) => emit('update:new-questionnaire', { ...newQuestionnaire.value, [prop]: event });

    return {
      // Data
      typeOptions,
      // Methods
      hide,
      input,
      submit,
      update,
    };
  },
};
</script>
