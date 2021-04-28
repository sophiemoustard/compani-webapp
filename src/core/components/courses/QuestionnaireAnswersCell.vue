<template>
  <q-card @click="$emit('click')">
    <q-card-section>
      <div class="type">{{ QUESTIONNAIRE_TYPES[questionnaire.type] }}</div>
      <div class="name ellipsis-2-lines">{{ questionnaire.name }}</div>
      <q-separator />
      <div class="q-ma-sm q-pa-xs text-center text-grey-800 bg-grey-300 answers">
        {{ formatQuantity('réponse',questionnaire.historiesCount) }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script>
import { QUESTIONNAIRE_TYPES } from '@data/constants';
import { formatQuantity } from '@helpers/utils';

export default {
  name: 'QuestionnaireAnswersCell',
  props: {
    questionnaire: { type: Object, required: true },
  },
  data () {
    return {
      formatQuantity,
      QUESTIONNAIRE_TYPES,
    };
  },
};
</script>

<style lang="stylus" scoped>
  .q-card
    border-radius: 10px !important
  .q-card__section
    width: 184px
    padding: 8px
    &:hover
      cursor: pointer
  .type
    font-size: 14px;
    color: $grey-800;
  .name
    margin 16px 0px;
    word-break: break-word;
    height: 48px;
  .answers
    border-radius: 10px !important
    width: 100px
</style>
