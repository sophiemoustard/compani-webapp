<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
        {{ label.action }}<span class="text-weight-bold">{{ label.interlocutor }}</span>
    </template>
      <ni-select in-modal :model-value="interlocutor._id" @update:model-value="update($event, '_id')"
        :caption="upperCaseFirstLetter(label.interlocutor)" :options="interlocutorsOptions" option-slot
        :error="validations.$error" :clearable="clearableInterlocutor" :required-field="!clearableInterlocutor">
        <template #option="{ scope }">
          <q-item v-bind="scope.itemProps">
            <q-item-section avatar>
              <img class="avatar" :src="scope.opt.picture">
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ scope.opt.label }}</q-item-label>
              <q-item-label class="details">
                <div class="q-mb-xs">{{ scope.opt.email }}</div>
              </q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </ni-select>
      <div v-if="showContact">
        <q-checkbox :model-value="interlocutor.isContact" label="Contact pour la formation" dense :disable="loading"
          @update:model-value="update($event, 'isContact')" />
        <div class="explanation">
          C'est le contact donné aux stagiaires s'ils ont des questions pratiques concernant la formation
        </div>
      </div>
      <template #footer>
        <ni-button class="bg-primary full-width modal-btn" :label="`${label.action}${label.interlocutor}`"
          icon-right="add" color="white" :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import set from 'lodash/set';
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Button from '@components/Button';
import { upperCaseFirstLetter } from '@helpers/utils';

export default {
  name: 'InterlocutorModal',
  props: {
    modelValue: { type: Boolean, default: false },
    interlocutorsOptions: { type: Array, default: () => [] },
    interlocutor: { type: Object, default: () => ({}) },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    label: { type: Object, default: () => ({}) },
    showContact: { type: Boolean, default: false },
    clearableInterlocutor: { type: Boolean, default: false },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:interlocutor'],
  setup (props, { emit }) {
    const hide = () => emit('hide');
    const input = event => emit('update:model-value', event);
    const submit = () => emit('submit');
    const update = (event, path) => emit('update:interlocutor', set({ ...props.interlocutor }, path, event));

    return {
      // Methods
      hide,
      input,
      submit,
      update,
      upperCaseFirstLetter,
    };
  },
};
</script>

<style lang="sass" scoped>
.details
  font-size: 14px
  color: $copper-grey-500
.explanation
  font-size: 12px
  color: $copper-grey-600
  margin: 0px 0px 24px 28px
</style>
