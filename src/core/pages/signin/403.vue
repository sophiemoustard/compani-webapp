<template>
  <div class="fixed-center text-center">
    <p>
      <img src="~assets/sad.svg" class="error-image">
    </p>
    <p class="text-faded">Le lien de réinitialisation du mot de passe a expiré.</p>
    <ni-button v-if="canGoBack" class="bg-primary q-mr-sm" color="white" @click="goBack" label="Retour" />
    <ni-button class="bg-primary" color="white" @click="goToForgot" label="Recevoir un nouveau lien" />
  </div>
</template>

<script>
import Button from '@components/Button';

export default {
  components: {
    'ni-button': Button,
  },
  data () {
    return {
      canGoBack: window.history.length > 1,
    };
  },
  methods: {
    goBack () {
      window.history.go(-1);
    },
    goToForgot () {
      this.$router.push({ name: 'forgotPassword' });
    },
  },
};
</script>
