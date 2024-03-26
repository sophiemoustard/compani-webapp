<template>
  <div class="row justify-center">
    <div class="caption input-caption">
      <p :class="[{ required: requiredField }]">{{ caption }}</p>
    </div>
    <q-icon v-if="error" name="error_outline" color="secondary" class="col-1" />
  </div>
  <div borderless :error="error" :error-message="errorMessage" class="container">
    <q-rating :model-value="modelValue" @update:model-value="update" :icon="icon" max="5" color="primary"
      size="lg" class="q-ma-md" />
  </div>
  <div class="labels" v-for="labelKey in Object.keys(labels)" :key="labelKey">
    {{ labelKey }} : {{ labels[labelKey] }}
  </div>
</template>

<script>
import { REQUIRED_LABEL } from '@data/constants';

export default {
  name: 'Rating',
  props: {
    modelValue: { type: Number, default: 0 },
    labels: { type: [Object], default: () => {} },
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
.container
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
.labels
  display: flex
  flex-direction: row
  justify-content: flex-start
  align-items: flex-start
  margin: 0 0 4px 0
  color: $copper-grey-500
</style>
