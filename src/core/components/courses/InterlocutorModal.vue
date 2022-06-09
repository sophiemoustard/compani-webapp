<template>
  <ni-modal :model-value="modelValue" @update:model-value="input" @hide="hide">
    <template #title>
        {{ label.action }} <span class="text-weight-bold">{{ label.interlocutor }}</span>
    </template>
      <ni-select in-modal :model-value="interlocutor" @update:model-value="update" :caption="label.interlocutor"
        :options="interlocutorsOptions" required-field option-slot :error="validations.$error">
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
      <template #footer>
        <ni-button class="bg-primary full-width modal-btn" :label="`${label.action} ${label.interlocutor}`"
          icon-right="add" color="white" :loading="loading" @click="submit" />
      </template>
    </ni-modal>
</template>

<script>
import Modal from '@components/modal/Modal';
import Select from '@components/form/Select';
import Button from '@components/Button';
import { userMixin } from '@mixins/userMixin';

export default {
  name: 'InterlocutorModal',
  mixins: [userMixin],
  props: {
    modelValue: { type: Boolean, default: false },
    interlocutorsOptions: { type: Array, default: () => [] },
    interlocutor: { type: String, default: '' },
    validations: { type: Object, default: () => ({}) },
    loading: { type: Boolean, default: false },
    label: { type: Object, default: () => ({}) },
  },
  components: {
    'ni-modal': Modal,
    'ni-select': Select,
    'ni-button': Button,
  },
  emits: ['hide', 'update:model-value', 'submit', 'update:interlocutor'],
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
    update (event) {
      this.$emit('update:interlocutor', event);
    },
  },
};
</script>

<style lang="sass" scoped>
.details
  font-size: 14px
  color: $copper-grey-500
</style>
