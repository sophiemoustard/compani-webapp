<template>
  <div class="container">
    <q-card class="cell-container" flat>
      <q-card-section class="title">{{ title }}</q-card-section>
      <q-card-section>
        <ni-rating v-if="answer" readonly :model-value="Number(answer)" :icon="icon" color="copper-grey-500" />
        <div class="answer" v-else>Pas de note</div>
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
.q-card
  padding: 16px 40px
  margin: 16px
  &__section
    margin: 0px
    padding: 0px
.container
  display: flex
  flex: 1
.cell-container
  display: flex
  flex: 1
  flex-direction: column
  align-items: center
  background-color: $peach-100
  border-radius: 8px
.answer
  font-size: 16px
  font-style: italic
  color: $copper-grey-500
  padding: 16px 0px
.title
  color: $copper-grey-700
  font-size: 20px
  padding: 4px 0px
</style>
