<template>
  <q-page padding class="client-background">
    Yo tout le monde c'est squeezie
  </q-page>
</template>

<script>
export default {
  metaInfo: { title: 'Structure partenaire' },
  props: {
    partnerOrganizationId: { type: String, required: true },
  },
  components: {
  },
  data () {
    return {
    };
  },
  async mounted () {
    console.log('ici', this.partnerOrganizationId);
  },
};
</script>
