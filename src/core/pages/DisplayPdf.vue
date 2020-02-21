<template>
  <div style="width: 100vw; height: 100vh">
    <object :data="blobUrl" :name="fileName" type="application/pdf" width="100%" height="100%" />
    <big>Votre navigateur ne peut pas charger l'aperçu, vous pouvez télécharger votre document en cliquant
       <a :href="blobUrl" :download="fileName">ici</a></big>
  </div>
</template>

<script>
export default {
  name: 'DisplayPdf',
  props: {
    fileName: String,
    blobUrl: String,
  },
}
</script>
