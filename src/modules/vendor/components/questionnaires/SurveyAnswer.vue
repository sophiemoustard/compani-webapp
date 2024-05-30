<template>
  <div>
    <q-card class="container" flat>
      <q-card-section class="title">{{ title }}</q-card-section>
      <q-card-section>
        <ni-rating v-if="answer" readonly :model-value="Number(answer)" :icon="icon" color="copper-500" />
        <div class="answer q-px-md q-py-sm" v-else>Pas de note</div>
      </q-card-section>
    </q-card>
  </div>
</template>

<script>
import { ref } from 'vue';
import Rating from '@components/Rating.vue';

export default {
  name: 'SurveyAnswer',
  props: {
    title: { type: String, required: true },
    answer: { type: String, required: true },
  },
  components: {
    'ni-rating': Rating,
  },
  setup () {
    const icon = ref([
      'mdi-numeric-1-box',
      'mdi-numeric-2-box',
      'mdi-numeric-3-box',
      'mdi-numeric-4-box',
      'mdi-numeric-5-box',
    ]);

    return {
      // Data
      icon,
    };
  },
};
</script>

<style lang="sass" scoped>
.container
  margin: 16px
  padding: 16px 24px
  background-color: $peach-100
  border-radius: 8px
  display: flex
  flex-direction: column
  flex: 1
.answer
  font-size: 36px
  color: $primary
  opacity: 0.8
  justify-content: center
.title
  display: flex
  flex: 1
  color: $primary
  font-size: 24px
  justify-content: center
</style>
