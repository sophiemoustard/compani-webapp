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
    traineeCompanyOptions: { type: Object, default: () => ({}) },
    displayCompanySelect: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update-trainee', 'open-learner-creation-modal'],
  computed: {
    companyOptionsForTrainee () {
      if (!this.newTraineeRegistration.trainee) return [];

      return this.traineeCompanyOptions[this.newTraineeRegistration.trainee];
    },
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
    updateTrainee (event) {
      this.$emit('update-trainee', set({ ...this.newTraineeRegistration }, 'trainee', event));
    },
    updateCompany (event) {
      this.$emit('update-trainee', set({ ...this.newTraineeRegistration }, 'company', event));
    },
    openLearnerCreationModal () {
      this.$emit('open-learner-creation-modal');
    },
  },
};
</script>

<style lang="sass" scoped>
.details
  font-size: 14px
  color: $copper-grey-500
</style>
