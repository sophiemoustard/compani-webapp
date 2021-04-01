<template>
  <q-card>
    <q-card-section>
      <div class="row justify-between">
        <div class="version">Version {{ index }}</div>
        <div v-if="questionnaire.status === DRAFT" class="draft">
          <q-icon size="12px" name="edit" color="orange-500" />
          Brouillon
        </div>
        <div v-else class="published">
          <q-icon size="12px" name="check_circle" color="green-800" />
          Publiée
        </div>
      </div>
      <div class="title">{{ questionnaire.title }}</div>
      <q-separator />
    </q-card-section>
  </q-card>
</template>

<script>
import { DRAFT } from '@data/constants';

export default {
  name: 'QuestionnaireCell',
  props: {
    questionnaire: { type: Object, required: true },
    index: { type: Number, required: true },
  },
  data () {
    return {
      DRAFT,
    };
  },
};
</script>

<style lang="stylus" scoped>
  .q-card__section
    width: 184px
    padding: 8px
    &:hover
      cursor: pointer
  .version
    font-size: 14px;
    color: $grey-800;
  .draft
    font-size: 12px;
    color: $orange-500;
  .published
    font-size: 12px;
    color: $green-800;
  .title
    margin 16px 0px;
  </style>
