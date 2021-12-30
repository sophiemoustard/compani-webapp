<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" class="error-image">
    </p>
    <p class="text-faded">Désolé, il n'y a rien ici...</p>
    <q-btn v-if="canGoBack" color="primary" @click="goBack">Retour</q-btn>
    <q-btn color="primary" @click="goTo">Accueil</q-btn>
  </div>
</template>

<script>
export default {
  name: 'Error404',
  data () {
    return {
      canGoBack: window.history.length > 1,
    };
  },
  methods: {
    goBack () {
      window.history.go(-1);
    },
    goTo () {
      return /\/ad\//.test(this.$route.path)
        ? this.$router.replace('/ad').catch((e) => {})
        : this.$router.replace('/').catch((e) => {});
    },
  },
};
</script>

<style lang="sass" scoped>
.q-btn
  margin: 5px
  width: 200px
</style>
