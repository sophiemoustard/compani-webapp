<template>
  <div>
    <q-card class="container" flat>
      <q-card-section class="title">{{ title }}</q-card-section>
      <q-card-section>
        <ni-rating v-if="answer" readonly :model-value="Number(answer)" :icon="icon" color="copper-grey-500" />
        <div class="answer q-px-md q-pb-md" v-else>Pas de note</div>
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
  padding: 0px 16px
  &__section
    margin: 0px
    padding: 0px
.container
  margin: 16px
  padding: 16px 24px
  background-color: $peach-100
  border-radius: 8px
  display: flex
  flex-direction: column
  flex: 1
.answer
  font-size: 24px
  font-style: italic
  color: $copper-600
  opacity: 0.8
  justify-content: center
  padding: 20px 56px
.title
  display: flex
  flex: 1
  color: $copper-grey-700
  font-size: 24px
  justify-content: center
  padding: 8px 0px 0px 0px
</style>
