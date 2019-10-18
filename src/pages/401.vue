<template>
  <div class="fixed-center text-center">
    <p>
      <img
        src="~assets/sad.svg"
        style="width:30vw;max-width:150px;"
      >
    </p>
    <p class="text-faded">Interdiction d'entrer ici !<strong> (401)</strong></p>
    <q-btn color="primary" style="width:200px;" @click="$router.replace('/')">Accueil</q-btn>
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
