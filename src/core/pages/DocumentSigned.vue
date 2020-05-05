<template>
  <div class="signed">
    <p>
      <img src="https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_texte_rose_1000.png" alt="Logo Compani" style="max-width: 250px">
    </p>
    <p>{{ acknowledgement }}</p>
    <p><q-btn v-if="$q.platform.is.mobile" color="primary" label="Accueil" icon="home" @click="$router.push('/')" /></p>
  </div>
</template>

<script>
export default {
  name: 'DocumentSigned',
  props: {
    signed: { type: String, default: 'false' },
  },
  computed: {
    acknowledgement () {
      if (this.$q.platform.is.desktop) {
        if (this.signed === 'true') return "Merci d'avoir signé ! Vous pouvez à présent fermer la fenêtre.";
        return 'Vous pouvez à présent fermer la fenêtre.';
      }
      if (this.signed === 'true') return "Merci d'avoir signé ! Vous pouvez à présent revenir à l'accueil";
      return "Vous pouvez à présent revenir à l'accueil";
    },
  },
}
</script>

<style lang="stylus" scoped>
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
