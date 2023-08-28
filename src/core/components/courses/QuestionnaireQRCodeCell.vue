<template>
  <q-card class="questionnaire-link">
    <text class="questionnaire-info">Répondre au questionnaire de {{ questionnaireTypeTitle }}</text>
    <div class="questionnaire-qrcode">
      <img :src="img" width="160" :alt="qrCodePlaceHolder">
    </div>
    <a class="clickable-name cursor-pointer q-mt-md" @click="onClick">
      Lien pour répondre au questionnaire de {{ questionnaireTypeTitle }}
    </a>
  </q-card>
</template>

<script>
import { toRefs, computed } from 'vue';
import { EXPECTATIONS } from '../../data/constants';

export default {
  name: 'QuestionnaireQRCodeCell',
  props: {
    img: { type: String, required: true },
    type: { type: String, required: true },
  },
  emits: ['click'],
  setup (props, { emit }) {
    const { type } = toRefs(props);

    const questionnaireTypeTitle = computed(() => (type.value === EXPECTATIONS
      ? 'recueil des attentes'
      : 'fin de formation'));

    const qrCodePlaceHolder = computed(() => `QR Code pour répondre au questionnaire
      de ${questionnaireTypeTitle.value}`);

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
</style>
