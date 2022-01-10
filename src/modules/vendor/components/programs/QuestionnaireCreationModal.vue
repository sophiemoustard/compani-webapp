<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input">
    <template #title>
      Créer un nouveau <span class="text-weight-bold">questionnaire</span>
    </template>
    <ni-input in-modal :model-value="newQuestionnaire.name" @update:model-value="update($event.trim(), 'name')"
      :error="validations.name.$error" @blur="validations.name.$touch" required-field caption="Nom" />
    <ni-select in-modal :model-value="newQuestionnaire.type" @update:model-value="update($event, 'type')"
      :options="typeOptions" :error="validations.type.$error" @blur="validations.type.$touch" required-field
      caption="Type" />
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Créer le questionnaire" color="primary" :loading="loading"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { QUESTIONNAIRE_TYPES } from '@data/constants';

export default {
  name: 'QuestionnaireCreationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    newQuestionnaire: { type: Object, default: () => ({}) },
  },
  emits: ['hide', 'update:model-value', 'update:new-questionnaire', 'submit'],
  data () {
    return {
      typeOptions: Object.keys(QUESTIONNAIRE_TYPES).map(type => ({ label: QUESTIONNAIRE_TYPES[type], value: type })),
    };
  },
  components: {
    'ni-input': Input,
    'ni-modal': Modal,
    'ni-select': Select,
  },
  methods: {
    hide () {
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:new-questionnaire', { ...this.newQuestionnaire, [prop]: event });
    },
  },
};
</script>
