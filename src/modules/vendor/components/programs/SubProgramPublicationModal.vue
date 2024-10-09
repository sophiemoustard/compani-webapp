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
        <company-select class="select" in-modal :company-options="companyOptions" :company="accessCompany"
          required-field @update="update" :validation="v$.accessCompany" :display-no-options-slot="displayNoOptionsSlot"
            caption="Structure" />
    </template>
    <template #footer>
      <q-btn no-caps class="full-width modal-btn" label="Publier avec cette règle d'accès" color="primary"
        icon-right="add" @click="submit" />
    </template>
  </ni-modal>
</template>

<script>
import { computed, ref } from 'vue';
import useVuelidate from '@vuelidate/core';
import { requiredIf } from '@vuelidate/validators';
import { FREE_ACCESS, RESTRICTED_ACCESS, ACCESS_OPTIONS } from '@data/constants';
import Modal from '@components/modal/Modal';
import OptionGroup from '@components/form/OptionGroup';
import { NotifyWarning } from '@components/popup/notify';
import CompanySelect from '@components/form/CompanySelect';

export default {
  name: 'SubProgramPublicationModal',
  props: {
    modelValue: { type: Boolean, default: false },
    companyOptions: { type: Array, default: () => [] },
    displayNoOptionsSlot: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-option-group': OptionGroup,
    'company-select': CompanySelect,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:selected-company'],
  setup (_, { emit }) {
    const access = ref(FREE_ACCESS);
    const accessCompany = ref('');

    const rules = computed(() => ({
      accessCompany: { required: requiredIf(access.value === RESTRICTED_ACCESS) },
    }));

    const v$ = useVuelidate(rules, { accessCompany });

    const hide = () => {
      access.value = FREE_ACCESS;
      accessCompany.value = '';
      emit('hide');
    };

    const input = event => emit('update:model-value', event);

    const submit = () => {
      v$.accessCompany.$touch();
      if (v$.accessCompany.$error) return NotifyWarning('Champ(s) invalide(s)');

      emit('submit', accessCompany.value);
    };

    const resetAccess = () => { accessCompany.value = ''; };

    const update = event => emit('update:selected-company', event);

    return {
      // Validations
      v$,
      // Data
      RESTRICTED_ACCESS,
      ACCESS_OPTIONS,
      access,
      accessCompany,
      // Methods
      hide,
      input,
      submit,
      resetAccess,
      update,
    };
  },
};
</script>

<style lang="sass" scoped>
.select
  margin-top: 32px
</style>
