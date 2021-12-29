<template>
  <div>
    <router-view />
    <q-ajax-bar color="primary" size="1px" />
  </div>
</template>

<script>
import { createMetaMixin } from 'quasar';

const metaInfo = {
  titleTemplate: titleChunk => (titleChunk ? `Compani - ${titleChunk}` : 'Compani'),
  htmlAttrs: { lang: 'fr' },
};

export default {
  name: 'App',
  mixins: [createMetaMixin(metaInfo)],
};
</script>
