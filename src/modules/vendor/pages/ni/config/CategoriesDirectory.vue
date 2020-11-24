<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Catégories" />
  </q-page>
</template>

<script>
import TitleHeader from '@components/TitleHeader';

export default {
  metaInfo: { title: 'Catégories' },
  name: 'CategoriesDirectory',
  components: {
    'ni-title-header': TitleHeader,
  },
  data () {
    return {
    };
  },
};
</script>
