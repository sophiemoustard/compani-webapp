<template>
  <ni-select in-modal :model-value="company" @blur="validation.$touch" :required-field="requiredField"
    caption="Structure" :options="companyOptions" :error="validation.$error" @update:model-value="update" option-slot>
    <template #option="{ scope }">
      <q-item v-bind="scope.itemProps">
        <q-item-section>
          <q-item-label>{{ scope.opt.label }}</q-item-label>
          <q-item-label class="details">
            <div class="q-mb-xs">{{ scope.opt.holding }}</div>
          </q-item-label>
        </q-item-section>
      </q-item>
    </template>
  </ni-select>
</template>

<script>
import Select from '@components/form/Select';

export default {
  name: 'CourseCreationModal',
  props: {
    company: { type: String, default: () => '' },
    companyOptions: { type: Array, default: () => [] },
    validation: { type: Object, default: () => ({}) },
    requiredField: { type: Boolean, default: false },
  },
  components: {
    'ni-select': Select,
  },
  emits: ['update:model-value'],
  setup (_, { emit }) {
    const update = event => emit('update:model-value', event);

    return {
      // Methods
      update,
    };
  },
};
</script>

<style lang="sass" scoped>
.details
  font-size: 14px
  color: $copper-grey-500
</style>
