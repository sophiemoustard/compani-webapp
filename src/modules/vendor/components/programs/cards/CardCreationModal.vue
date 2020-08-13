<template>
  <ni-modal :value="value" @input="$emit('input', $event)" @hide="$emit('hide')" container-class="modal-container-md">
    <template slot="title">
      Créer une nouvelle <span class="text-weight-bold">carte</span>
    </template>
    <h6 class="text-weight-bold">Cours</h6>
    <div class="row q-mb-xl button-container">
      <div v-for="template in COURSE_TEMPLATE_TYPES" :key="template.value" @click="selectTemplate(template.value)"
        :class="getClass(template.value)">
        <div class="text-weight-bold card-button-content">
          <template v-if="template.value === TITLE_TEXT_MEDIA">
            <div>Titre</div>
            <div>Texte</div>
            <q-icon name="image" size="sm" />
          </template>
          <template v-else-if="template.value === TEXT_MEDIA">
            <div>Texte</div>
            <q-icon name="image" size="sm" />
          </template>
          <template v-else-if="template.value === FLASHCARD">
            <div>Flashcard</div>
            <div class="row flashcard">
              <div class="flashcard-left" />
              <div class="flashcard-right" />
            </div>
          </template>
          <template v-else>{{ formatButtonLabel(template.label) }}</template>
        </div>
      </div>
    </div>
    <h6 class="text-weight-bold">Quiz</h6>
    <div class="row q-mb-xl button-container">
      <div v-for="template in QUIZ_TEMPLATE_TYPES" :key="template.value" @click="selectTemplate(template.value)"
        :class="getClass(template.value)">
        <div class="text-weight-bold card-button-content">
          <template v-if="template.value === FILL_THE_GAPS">
            <div class="q-mb-sm">Texte à trou</div>
            <div class="fill-the-gaps">Ceci est un ____</div>
          </template>
          <template v-else-if="template.value === MULTIPLE_CHOICE_QUESTION">
            <div class="q-mb-sm">QCM</div>
            <q-icon name="fas fa-list" size="sm" />
          </template>
          <template v-else-if="template.value === SINGLE_CHOICE_QUESTION">
            <div class="q-mb-sm">QCU</div>
            <q-icon name="fas fa-list-ul" size="sm" />
          </template>
          <template v-else-if="template.value === ORDER_THE_SEQUENCE">
            <div class="q-mb-sm order-the-sequence">Mettre dans l'ordre</div>
            <q-icon name="fas fa-list-ol" size="sm" />
          </template>
        </div>
      </div>
    </div>
    <template slot="footer">
      <q-btn no-caps class="full-width modal-btn" label="Créer la carte" color="primary" :loading="loading"
        icon-right="add" @click="$emit('create')" />
    </template>
  </ni-modal>
</template>

<script>
import {
  COURSE_TEMPLATE_TYPES,
  QUIZ_TEMPLATE_TYPES,
  TITLE_TEXT_MEDIA,
  TEXT_MEDIA,
  FLASHCARD,
  FILL_THE_GAPS,
  MULTIPLE_CHOICE_QUESTION,
  SINGLE_CHOICE_QUESTION,
  ORDER_THE_SEQUENCE,
} from '@data/constants';
import Modal from '@components/modal/Modal';

export default {
  name: 'CardCreationModal',
  props: {
    value: { type: Boolean, default: false },
    loading: { type: Boolean, default: false },
    card: { type: Object, required: true },
  },
  components: {
    'ni-modal': Modal,
  },
  data () {
    return {
      COURSE_TEMPLATE_TYPES,
      QUIZ_TEMPLATE_TYPES,
      TITLE_TEXT_MEDIA,
      TEXT_MEDIA,
      FLASHCARD,
      FILL_THE_GAPS,
      MULTIPLE_CHOICE_QUESTION,
      SINGLE_CHOICE_QUESTION,
      ORDER_THE_SEQUENCE,
    }
  },
  methods: {
    getClass (template) {
      return ['card-button', 'cursor-pointer', { 'card-button-selected': this.card.template === template }]
    },
    selectTemplate (template) {
      this.card.template = template;
    },
    formatButtonLabel (label) {
      return label.replace(/ /g, '\n');
    },
  },
}
</script>

<style lang="stylus" scoped>
h6
  margin-bottom: 3px

.button-container
  display: grid
  grid-template-columns: repeat(auto-fill, 114px)
  justify-content: center
  @media (max-width: 767px)
    grid-template-columns: repeat(auto-fill, 79px)

.card-button
  background-color: $light-grey
  color: $dark-grey
  border-radius: 10px
  height: 130px
  width: 100px
  @media (max-width: 767px)
    width: 65px
    height: 90px
  display: flex
  align-items: center
  justify-content: center
  margin: 10px 7px
  &-selected
    background-color: $dark-grey
    color: $light-grey
  &-content
    text-align: center
    flex-wrap: wrap
    white-space: pre-line
  .flashcard
    justify-content: center
    & > div
      width: 40%
      height: 42px
      margin: 8px 3px
      border-radius: 3px
      @media (max-width: 767px)
        width: 30%
        height: 30px
    .flashcard-right
      background-color: $grey
    .flashcard-left
      background-color: $middle-grey
  .fill-the-gaps
    font-size: 10px
</style>
