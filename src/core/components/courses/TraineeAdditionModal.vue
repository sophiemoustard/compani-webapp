<template>
  <ni-modal :value="value" @input="input" @hide="hide">
    <template #title>
        Ajouter une <span class="text-weight-bold">personne</span>
      </template>
      <ni-select in-modal :value="newTrainee" @input="update" caption="Stagiaire" :error="validations.$error"
        :options="traineesOptions" required-field option-slot>
        <template #option="scope">
          <q-item v-bind="scope.scope.itemProps" v-on="scope.scope.itemEvents">
            <q-item-section avatar>
              <img class="avatar" :src="scope.scope.opt.picture">
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.scope.opt.label }}</q-item-label>
              <q-item-label class="details">
                <div class="q-mb-xs">{{ scope.scope.opt.email }}</div>
                <div>{{ scope.scope.opt.company }}</div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template slot="no-option">
           <ni-button color="primary" icon="add" label="Créer un nouveau compte" @click="openLearnerCreationModal" />
        </template>
      </ni-select>
      <template #footer>
        <q-btn no-caps class="full-width modal-btn" label="Ajouter la personne" icon-right="add" color="primary"
          :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Button from '@components/Button';
import { userMixin } from '@mixins/userMixin';

export default {
  name: 'TraineeAdditionModal',
  mixins: [userMixin],
  props: {
    value: { type: Boolean, default: false },
    traineesOptions: { type: Array, default: () => [] },
    newTrainee: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-button': Button,
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
    update (event) {
      this.$emit('update:newTrainee', event);
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
