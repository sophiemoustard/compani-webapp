<template>
  <ni-modal :value="value" @hide="hide" @input="input">
    <template slot="title">
      Créer un nouveau <span class="text-weight-bold">questionnaire</span>
    </template>
    <ni-input in-modal :value="newQuestionnaire.title" @input="update($event.trim(), 'title')"
      :error="validations.title.$error" @blur="validations.title.$touch" required-field caption="Titre" />
    <ni-select in-modal :value="newQuestionnaire.type" @input="update($event, 'type')" :options="typeOptions"
      :error="validations.type.$error" @blur="validations.type.$touch" required-field caption="Type" />
    <template slot="footer">
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
    value: { type: Boolean, default: false },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    newQuestionnaire: { type: Object, default: () => ({}) },
  },
  data () {
    return {
      typeOptions: QUESTIONNAIRE_TYPES,
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
      this.$emit('input', event);
    },
    submit () {
      this.$emit('submit');
    },
    update (event, prop) {
      this.$emit('update:newQuestionnaire', { ...this.newQuestionnaire, [prop]: event });
    },
  },
};
</script>
