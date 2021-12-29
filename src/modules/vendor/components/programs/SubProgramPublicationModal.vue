<template>
  <ni-modal :model-value="modelValue" @hide="hide" @update:model-value="input" container-class="modal-container-md">
    <template #title>
      Définir une <span class="text-weight-bold">règle d'accès</span>
    </template>
    <ni-option-group v-model="access" :options="ACCESS_OPTIONS" inline type="radio" @update:model-value="resetAccess" />
    <template v-if="access === RESTRICTED_ACCESS">
      <span class="text-italic">
        Seuls les apprenants de la structure choisie auront accès à la formation.
        Vous pourrez modifier et rajouter des règles d’accès par la suite.
      </span>
      <ni-select class="select" in-modal v-model="accessCompany" required-field caption="Structure"
        :options="companyOptions" :error="v$.accessCompany.$error" />
    </template>
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Publier avec cette règle d'accès" color="primary"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import Modal from '@components/modal/Modal';
import OptionGroup from '@components/form/OptionGroup';
import Select from '@components/form/Select';
import { NotifyWarning } from '@components/popup/notify';
import { FREE_ACCESS, RESTRICTED_ACCESS, ACCESS_OPTIONS } from '@data/constants';

export default {
  name: 'SubProgramPublicationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    companyOptions: { type: Array, default: () => [] },
  },
  components: {
    'ni-modal': Modal,
    'ni-option-group': OptionGroup,
    'ni-select': Select,
  },
  emits: ['hide', 'update:model-value', 'submit'],
  setup () {
    return { v$: useVuelidate() };
  },
  data () {
    return {
      access: FREE_ACCESS,
      RESTRICTED_ACCESS,
      ACCESS_OPTIONS,
      accessCompany: '',
    };
  },
  validations () {
    return { accessCompany: { required: requiredIf(() => this.access === RESTRICTED_ACCESS) } };
  },
  methods: {
    hide () {
      this.access = FREE_ACCESS;
      this.accessCompany = '';
      this.$emit('hide');
    },
    input (event) {
      this.$emit('update:model-value', event);
    },
    submit () {
      this.v$.accessCompany.$touch();
      if (this.v$.accessCompany.$error) return NotifyWarning('Champ(s) invalide(s)');

      this.$emit('submit', this.accessCompany);
    },
    resetAccess () {
      this.accessCompany = '';
    },
  },
};
</script>

<style lang="sass" scoped>
.select
  margin-top: 32px
</style>
