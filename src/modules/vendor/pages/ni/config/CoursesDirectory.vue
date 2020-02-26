<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire formations" search-placeholder="Rechercher une formation" />
  </q-page>
</template>

<script>
import DirectoryHeader from '@components/DirectoryHeader';

export default {
  metaInfo: { title: 'Répertoire formation' },
  name: 'CoursesDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
  },
}
</script>
