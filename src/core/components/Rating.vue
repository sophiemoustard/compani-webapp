<template>
  <div class="row items-start">
    <div class="caption input-caption">
      <p :class="[{ required: requiredField }]">{{ caption }}</p>
      <span class="q-mx-sm">(1 : {{ leftLabel }} - 5 : {{ rightLabel }})</span>
    </div>
    <q-icon v-if="error" name="error_outline" color="secondary" class="col-1" />
  </div>
  <q-field borderless :error="error" :error-message="errorMessage">
    <q-rating :model-value="modelValue" @update:model-value="update" :icon="icon" max="5" color="primary"
      size="lg" class="q-mx-sm">
      <template #tip-1>
        <q-tooltip>{{ leftLabel }}</q-tooltip>
      </template>
      <template #tip-5>
        <q-tooltip>{{ rightLabel }}</q-tooltip>
      </template>
    </q-rating>
  </q-field>
</template>

<script>
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'Rating',
  props: {
    modelValue: { type: Number, default: 0 },
    leftLabel: { type: String, required: true },
    rightLabel: { type: String, required: true },
    icon: { type: [String, Array], default: 'circle' },
    caption: { type: String, default: '' },
    error: { type: Boolean, default: false },
    errorMessage: { type: String, default: REQUIRED_LABEL },
    requiredField: { type: Boolean, default: false },
  },
  emits: ['update:model-value'],
  setup (_, { emit }) {
    const update = (value) => {
      emit('update:model-value', value);
    };

    return {
      // Methods
      update,
    };
  },
};
</script>
<style lang="sass" scoped>
.caption
  flex: 1
</style>
