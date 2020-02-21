<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" class="error-image">
    </p>
    <p class="text-faded">Interdiction d'entrer ici !</p>
    <q-btn color="primary" @click="$router.replace('/')">Accueil</q-btn>
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
  },
}
</script>

<style lang="stylus" scoped>
.q-btn
  margin: 5px
  width:200px
</style>
