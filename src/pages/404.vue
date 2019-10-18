<template>
  <div class="fixed-center text-center">
    <p>
      <img
        src="~assets/sad.svg"
        style="width:30vw;max-width:150px;"
      >
    </p>
    <p class="text-faded">Désolé, il n'y a rien ici...<strong> (404)</strong></p>
    <q-btn v-if="canGoBack" color="primary" style="width:200px;" @click="goBack">Retour</q-btn>
    <q-btn color="primary" style="width:200px;" @click="$router.replace('/')">Accueil</q-btn>
  </div>
</template>

<script>
export default {
  name: 'Error404',
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
