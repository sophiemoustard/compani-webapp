<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" class="error-image">
    </p>
    <p class="text-faded">Le lien de réinitialisation du mot de passe a expiré.</p>
    <q-btn v-if="canGoBack" class="q-mr-sm" color="primary" @click="goBack">Retour</q-btn>
    <q-btn color="primary" @click="goToForgot">Recevoir un nouveau lien</q-btn>
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
      this.$router.push({ path: '/forgot-password' });
    },
  },
}
</script>
