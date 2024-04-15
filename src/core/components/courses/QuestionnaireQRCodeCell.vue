<template>
  <q-card class="questionnaire-link">
    <text class="questionnaire-info">Répondre au questionnaire</text>
    <div class="questionnaire-qrcode">
      <img :src="img" width="160" alt="QR Code pour répondre au questionnaire">
    </div>
    <a class="clickable-name cursor-pointer text-link" @click="onClick">Lien pour répondre au questionnaire</a>
  </q-card>
</template>

<script>

export default {
  name: 'QuestionnaireQRCodeCell',
  props: {
    img: { type: String, required: true },
  },
  emits: ['click'],
  setup (_, { emit }) {
    const onClick = () => emit('click');

    return {
      // Methods
      onClick,
      // Computed
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
