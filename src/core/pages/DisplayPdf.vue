<template>
  <div style="width: 100vw; height: 100vh">
    <object :data="blobUrl" :name="fileName" type="application/pdf" width="100%" height="100%" />
    <div class="info">
      Si votre navigateur ne peut pas charger l'aperçu, vous pouvez télécharger votre document&nbsp;
      <a :href="blobUrl" :download="fileName">en cliquant ici </a>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DisplayPdf',
  props: {
    fileName: { type: String, required: true },
    blobUrl: { type: String, required: true },
  },
};
</script>

<style lang="sass" scoped>
.info
  text-align: center
</style>
