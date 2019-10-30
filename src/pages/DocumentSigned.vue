<template>
  <div class="fixed-center">
    <p>
      <img src="https://res.cloudinary.com/alenvi/image/upload/v1546865717/images/business/Compani/compani_texte_rose_1000.png" alt="Logo Compani" style="max-width: 250px">
    </p>
    <p>{{ acknowledgement }}</p>
    <p><q-btn v-if="$q.platform.is.mobile" color="primary" label="Accueil" icon="home" @click="$router.push('/')" /></p>
  </div>
</template>

<script>
export default {
  props: {
    signed: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    acknowledgement () {
      if (this.$q.platform.is.desktop) {
        if (this.signed) return "Merci d'avoir signé ! Vous pouvez à présent fermer la fenêtre.";
        return 'Vous pouvez à présent fermer la fenêtre.';
      }
      if (this.signed) return "Merci d'avoir signé ! Vous pouvez à présent revenir à l'accueil";
      return "Vous pouvez à présent revenir à l'accueil";
    },
  },
}
</script>
