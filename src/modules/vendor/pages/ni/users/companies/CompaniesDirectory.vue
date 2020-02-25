<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Répertoire structures" search-placeholder="Rechercher une structure" />
  </q-page>
</template>

<script>
import DirectoryHeader from '@components/DirectoryHeader';

export default {
  metaInfo: { title: 'Répertoire structures' },
  name: 'CompaniesDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
  },
}
</script>
