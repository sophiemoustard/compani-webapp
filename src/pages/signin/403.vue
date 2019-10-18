<template>
  <div class="fixed-center text-center">
    <p>
      <img
        src="~assets/sad.svg"
        style="width:30vw;max-width:150px;"
      >
    </p>
    <p class="text-faded">Le lien de réinitialisation du mot de passe a expiré.<strong>(403)</strong></p>
    <q-btn v-if="canGoBack" color="primary" style="width:200px;" @click="goBack">Retour</q-btn>
    <q-btn color="primary" style="width:200px;" @click="goToForgot">Recevoir un nouveau lien</q-btn>
  </div>
</template>

<script>
export default {
  data () {
    return {
      canGoBack: window.history.length > 1,
    }
  },
  methods: {
    goBack () {
      window.history.go(-1);
    },
    goToForgot () {
      this.$router.push({ path: '/forgotPassword' });
    },
  },
}
</script>
