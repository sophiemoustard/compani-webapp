<template>
  <div>
    <q-banner v-if="disabledFollowUp" class="full-width warning q-mb-md" dense>
      <q-icon size="sm" name="warning" />
      <div>
        Il manque la ou les information(s) suivante(s) pour assurer le suivi de la formation :
        {{ followUpMissingInfo.join(', ') }}.
      </div>
    </q-banner>
    <div class="course-link">
      <q-item>
        <q-item-section side>
          <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="info" flat dense />
        </q-item-section>
        <q-item-section class="course-link">Page info formation</q-item-section>
      </q-item>
      <div class="course-link-share">
        <q-btn color="primary" size="xs" :disable="disabledFollowUp" icon="link" flat dense />
        <div class="course-link-share-label" :class="{ 'course-link-share-label-disabled': disabledFollowUp }"
          color="primary">
          Obtenir un lien de partage
        </div>
      </div>
    </div>
    <q-item>
      <q-item-section side>
        <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="mdi-cellphone-message" flat dense />
      </q-item-section>
      <q-item-section>Envoyer un SMS de convocation ou de rappel aux stagiaires</q-item-section>
    </q-item>
    <q-item>
      <q-item-section side>
        <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="file_download" flat dense
          type="a" :href="downloadAttendanceSheet()" target="_blank" />
      </q-item-section>
      <q-item-section>Télécharger les feuilles d'émargement</q-item-section>
    </q-item>
    <q-item>
      <q-item-section side>
        <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="file_download" flat dense />
      </q-item-section>
      <q-item-section>Télécharger les attestations de fin de formation</q-item-section>
    </q-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import Courses from '@api/Courses';

export default {
  name: 'ProfileFollowUp',
  props: {
    profileId: { type: String },
  },
  computed: {
    ...mapGetters({ course: 'course/getCourse' }),
    disabledFollowUp () {
      return this.followUpMissingInfo.length > 0;
    },
    followUpMissingInfo () {
      const missingInfo = [];
      if (!this.course.trainer) missingInfo.push('le formateur');
      if (!this.course.trainees || !this.course.trainees.length) missingInfo.push('le ou les stagiaire(s)');
      if (!this.course.slots || !this.course.slots.length) missingInfo.push('le ou les créneau(x)');

      return missingInfo;
    },
  },
  methods: {
    downloadAttendanceSheet () {
      return Courses.downloadAttendanceSheet(this.course._id);
    },
  },
}
</script>

<style lang="stylus" scoped>
.course-link
  @media screen and (min-width: 1025px)
    display: flex
    flex-direction: row
    align-items: center
    justify-content: left
  &-share
    display: flex
    flex-direction: row
    align-items: center
    @media screen and (max-width: 1024px)
      padding: 0 0 10px 55px
    &-label
      cursor: pointer
      color: $primary
      text-decoration underline
      font-size: 14px
      @media screen and (max-width: 767px)
        font-size: 12px
      &-disabled
        opacity: 0.7 !important;
        cursor: not-allowed !important
</style>
