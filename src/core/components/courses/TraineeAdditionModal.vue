<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
        Ajouter une <span class="text-weight-bold">personne</span>
      </template>
      <ni-select in-modal :model-value="newTraineeRegistration.trainee" @update:model-value="updateTrainee"
        caption="Stagiaire" :options="traineesOptions" required-field option-slot :error="validations.trainee.$error">
        <template #option="{ scope }">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <img class="avatar" :src="scope.opt.picture">
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label class="details">
                <div class="q-mb-xs">{{ scope.opt.email }}</div>
                <div>{{ scope.opt.company }}</div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template #no-option>
          <ni-button color="primary" icon="add" label="Créer un nouveau compte" @click="openLearnerCreationModal" />
        </template>
      </ni-select>
      <ni-select v-if="displayCompanySelect" in-modal :model-value="newTraineeRegistration.company"
        @update:model-value="updateCompany" caption="Structure" :options="companyOptionsForTrainee" required-field
        :error="validations.company.$error" :disable="companyOptionsForTrainee.length < 2" />
      <template #footer>
        <ni-button class="bg-primary full-width modal-btn" label="Ajouter la personne" icon-right="add" color="white"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>

import set from 'lodash/set';
import { computed, toRefs } from 'vue';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Button from '@components/Button';

export default {
  name: 'TraineeAdditionModal',
  props: {
    modelValue: { type: Boolean, default: false },
    traineesOptions: { type: Array, default: () => [] },
    newTraineeRegistration: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    traineesCompanyOptions: { type: Object, default: () => ({}) },
    displayCompanySelect: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:new-trainee-registration', 'open-learner-creation-modal'],
  setup (props, { emit }) {
    const { newTraineeRegistration, traineesCompanyOptions } = toRefs(props);

    const companyOptionsForTrainee = computed(() => {
      if (!newTraineeRegistration.value.trainee) return [];

      return traineesCompanyOptions.value[newTraineeRegistration.value.trainee] || [];
    });

    const hide = () => emit('hide');

    const input = event => emit('update:model-value', event);

    const submit = () => emit('submit');

    const updateTrainee = (event) => {
      if (traineesCompanyOptions.value[event].length === 1) {
        const company = traineesCompanyOptions.value[event][0].value;
        emit('update:new-trainee-registration', { company, trainee: event });
      } else {
        emit('update:new-trainee-registration', set({ ...newTraineeRegistration.value }, 'trainee', event));
      }
    };

    const updateCompany = (event) => {
      emit('update:new-trainee-registration', set({ ...newTraineeRegistration.value }, 'company', event));
    };

    const openLearnerCreationModal = () => emit('open-learner-creation-modal');

    return {
      // Computed
      companyOptionsForTrainee,
      // Methods
      hide,
      input,
      submit,
      updateTrainee,
      updateCompany,
      openLearnerCreationModal,
    };
  },
};
</script>

<style lang="sass" scoped>
.details
  font-size: 14px
  color: $copper-grey-500
</style>
