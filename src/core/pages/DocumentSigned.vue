<template>
  <div class="signed">
    <p><img :src="BLUE_TEXT_LOGO" alt="Logo Compani" style="max-width: 250px"></p>
    <p>{{ acknowledgement }}</p>
    <p><q-btn v-if="$q.platform.is.mobile" color="primary" label="Accueil" icon="home" @click="$router.push('/')" /></p>
  </div>
</template>

<script>
import { BLUE_TEXT_LOGO } from '@data/constants';

export default {
  name: 'DocumentSigned',
  props: {
    signed: { type: String, default: 'false' },
  },
  data () {
    return {
      BLUE_TEXT_LOGO,
    };
  },
  computed: {
    acknowledgement () {
      if (this.$q.platform.is.desktop) {
        if (this.signed === 'true') return 'Merci d\'avoir signé ! Vous pouvez à présent fermer la fenêtre.';
        return 'Vous pouvez à présent fermer la fenêtre.';
      }
      if (this.signed === 'true') return 'Merci d\'avoir signé ! Vous pouvez à présent revenir à l\'accueil';
      return 'Vous pouvez à présent revenir à l\'accueil';
    },
  },
};
</script>

<style lang="sass" scoped>
.signed
  position: absolute
  background-color: white
  width: 100%
  height: 100%
  display: flex
  flex-direction: column
  align-items: center
  justify-content: center
</style>
