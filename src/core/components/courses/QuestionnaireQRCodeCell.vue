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
import { END_OF_COURSE, EXPECTATIONS } from '../../data/constants';

export default {
  name: 'QuestionnaireQRCodeCell',
  props: {
    img: { type: String, required: true },
    type: { type: String, required: true },
  },
  emits: ['click'],
  setup (props, { emit }) {
    const { type } = toRefs(props);

    const questionnaireTypeTitle = computed(() => {
      switch (type.value) {
        case EXPECTATIONS:
          return 'de recueil des attentes';
        case END_OF_COURSE:
          return 'de fin de formation';
        default:
          return 'd\'auto-positionnement';
      }
    });

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
