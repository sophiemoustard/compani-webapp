<template>
  <q-page padding class="client-background">
    <ni-title-header title="Vos contacts Compani" class="q-mb-lg" />
    <span class="text-italic">
      Des questions sur l'organisation d'une formation ? Retrouvez le contact sur l’onglet “Organisation”
      de la formation.
    </span>
  </q-page>
</template>

<script>
import TitleHeader from '@components/TitleHeader';

export default {
  name: 'ContactProfile',
  components: {
    'ni-title-header': TitleHeader,
  },
  setup () {
    return {
    };
  },
};
</script>
