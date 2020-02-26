<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire formateurs" />
  </q-page>
</template>

<script>
import DirectoryHeader from '@components/DirectoryHeader';

export default {
  metaInfo: { title: 'Répertoire formateurs' },
  name: 'TrainersDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
  },
}
</script>
