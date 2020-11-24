<template>
  <q-page class="vendor-background" padding>
    <ni-title-header title="Catégories" />
    <div>
      {{ categories }}
    </div>
  </q-page>
</template>

<script>
import TitleHeader from '@components/TitleHeader';
import { NotifyNegative } from '@components/popup/notify';
import Categories from '@api/Categories';

export default {
  metaInfo: { title: 'Catégories' },
  name: 'CategoriesDirectory',
  components: {
    'ni-title-header': TitleHeader,
  },
  data () {
    return {
      tableLoading: false,
      categories: [],
    };
  },
  async created () {
    await this.refreshCategories();
  },
  methods: {
    async refreshCategories () {
      try {
        this.tableLoading = true;
        this.categories = await Categories.list();
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la récupération des catégories.');
      } finally {
        this.tableLoading = false;
      }
    },
  },
};
</script>
