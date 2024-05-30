<template>
  <div class="container">
    <q-separator color="orange-100" />
    <q-item-section @click="showDetails()" class="header">
      Afficher le détail des légendes
      <q-icon size="xs" :name="iconName" color="orange-300" />
    </q-item-section>
    <q-separator color="orange-100" />
    <div v-if="showLabels" class="labels">
      <template v-for="labelKey of Object.keys(labels)" :key="labelKey">
        <div>{{ labelKey }} : {{ labels[labelKey] }}</div>
      </template>
    </div>
  </div>
</template>

<script>
import { computed, toRefs, ref } from 'vue';

export default {
  name: 'SurveyLabelsDetails',
  props: {
    areDetailsVisible: { type: Boolean, default: false },
    labels: { type: Object, default: () => {}, required: true },
  },
  components: {
  },
  setup (props) {
    const { areDetailsVisible } = toRefs(props);
    const showLabels = ref(areDetailsVisible.value);

    const iconName = computed(() => (showLabels.value ? 'expand_less' : 'expand_more'));

    const showDetails = () => { showLabels.value = !showLabels.value; };

    return {
      // Data
      showLabels,
      // Computed
      iconName,
      // Methods
      showDetails,
    };
  },
};
</script>

<style lang="sass" scoped>
.container
  margin: 16px
  padding: 8px
.header
  display: flex
  flex-direction: row
  justify-content: space-between
.q-item__section
  margin: 0px
  padding: 12px
.labels
  padding: 12px
  font-size: 12px
</style>
