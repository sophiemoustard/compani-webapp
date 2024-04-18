<template>
  <q-card class="questionnaire-link">
    <text class="questionnaire-info">Répondre au questionnaire {{ questionnaireTypeTitle }}</text>
    <div class="questionnaire-qrcode">
      <img :src="img" width="160" :alt="qrCodePlaceHolder">
    </div>
    <a class="clickable-name cursor-pointer text-link" @click="onClick">
      Lien pour répondre au questionnaire {{ questionnaireTypeTitle }}
    </a>
  </q-card>
</template>

<script>
import { toRefs, computed } from 'vue';
import { getQuestionnaireTypeTitle } from '@helpers/courses';

export default {
  name: 'QuestionnaireQRCodeCell',
  props: {
    img: { type: String, required: true },
    types: { type: Array, required: true },
  },
  emits: ['click'],
  setup (props, { emit }) {
    const { types } = toRefs(props);

    const questionnaireTypeTitle = computed(() => getQuestionnaireTypeTitle(types.value));

    const qrCodePlaceHolder = computed(() => `QR Code pour répondre au questionnaire ${questionnaireTypeTitle.value}`);

    const onClick = () => emit('click');

    return {
      // Methods
      onClick,
      // Computed
      questionnaireTypeTitle,
      qrCodePlaceHolder,
    };
  },
};
</script>

<style lang="sass" scoped>
.questionnaire-link
  padding: 16px
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
.questionnaire-qrcode
  padding: 16px 0 0 0px
  display: flex
  flex-direction: row
.questionnaire-info
  font-weight: bold
  font-size: 14px

.text-link
  font-size: 14px
  margin: 12px 0 0 0
</style>
