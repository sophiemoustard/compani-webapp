<template>
  <q-page class="neutral-background" padding>
    <ni-directory-header title="Formations" search-placeholder="Rechercher une formation"
      @updateSearch="updateSearch" :search="searchStr" />
  </q-page>
</template>

<script>
import DirectoryHeader from '@components/DirectoryHeader';

export default {
  metaInfo: { title: 'Catalogue' },
  name: 'CourseDirectory',
  components: {
    'ni-directory-header': DirectoryHeader,
  },
  data () {
    return {
      searchStr: '',
    }
  },
  methods: {
    updateSearch (value) {
      this.searchStr = value;
    },
  },
}
</script>
