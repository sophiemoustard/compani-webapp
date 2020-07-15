<template>
  <q-page padding class="vendor-background" v-if="this.activity">
    <ni-profile-header :title="activity.title">
      <template v-slot:body>
        <div class="row profile-info q-pl-lg">
          <q-item v-for="info of headerInfo" class="col-md-6 col-xs-12" :key="info.icon">
            <q-item-section side><q-icon size="xs" :name="info.icon"/></q-item-section>
            <q-item-section>{{ info.label }}</q-item-section>
          </q-item>
        </div>
      </template>
    </ni-profile-header>
  </q-page>
</template>

<script>
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import Activities from '@api/Activities';

export default {
  name: 'ActivityProfile',
  metadata: { title: 'Fiche activité' },
  props: {
    activityId: { type: String },
    programName: { type: String },
    stepTitle: { type: String },
  },
  components: {
    'ni-profile-header': ProfileHeader,
  },
  data () {
    return {
      activity: {},
    };
  },
  computed: {
    headerInfo () {
      const infos = [
        { icon: 'library_books', label: this.programName },
        { icon: 'book', label: this.stepTitle },
      ]

      return infos;
    },
  },
  async created () {
    this.activity = await Activities.getById(this.activityId);
  },
}
</script>

<style lang="stylus" scoped>
.q-item
  padding: 0
  min-height: 0
</style>
