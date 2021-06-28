<template>
  <q-card @click="$emit('click')">
    <q-card-section>
      <div class="row justify-between">
        <div class="version">Version {{ index }}</div>
        <div v-if="questionnaire.status === DRAFT" class="info-warning draft">
          <q-icon size="12px" name="edit" />
          Brouillon
        </div>
        <div v-else class="published info-active">
          <q-icon size="12px" name="check_circle" />
          Publié
        </div>
      </div>
      <div class="name ellipsis-2-lines">{{ questionnaire.name }}</div>
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
    color: $copper-grey-800;
  .draft
    font-size: 12px;
  .published
    font-size: 12px;
  .name
    margin 16px 0px;
    word-break: break-word;
    height: 48px;
  </style>
