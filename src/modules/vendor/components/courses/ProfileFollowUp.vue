<template>
  <div>
    <q-banner v-if="disabledFollowUp" class="full-width warning" dense>
      <q-icon size="sm" name="warning" />
      <div>
        Il manque la ou les information(s) suivante(s) pour assurer le suivi de la formation :
        {{ followUpMissinInfo.join(', ') }}.
      </div>
    </q-banner>
    <div class="course-link">
      <q-item>
        <q-item-section side>
          <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="info" flat dense />
        </q-item-section>
        <q-item-section class="course-link">Page info formation</q-item-section>
      </q-item>
      <q-item>
        <q-item-section side>
          <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="link" flat dense />
        </q-item-section>
        <q-item-section color="primary">Obtenir un lien de partage</q-item-section>
      </q-item>
    </div>
    <q-item>
      <q-item-section side>
        <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="mdi-cellphone-message" flat dense />
      </q-item-section>
      <q-item-section>Envoyer un SMS de convocation ou de rappel aux stagiaires</q-item-section>
    </q-item>
    <q-item>
      <q-item-section side>
        <q-btn color="primary" size="sm" :disable="disabledFollowUp" icon="file_download" flat dense />
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
import { mapGetters } from 'vuex'
export default {
  name: 'ProfileFollowUp',
  props: {
    profileId: { type: String },
  },
  computed: {
    ...mapGetters({ course: 'course/getCourse' }),
    disabledFollowUp () {
      return this.followUpMissinInfo.length > 0;
    },
    followUpMissinInfo () {
      const missingInfo = [];
      if (!this.course.trainer) missingInfo.push('le formatteur');
      if (!this.course.trainees || !this.course.trainees.length) missingInfo.push('le ou les stagiaure(s)');
      if (!this.course.slots || !this.course.slots.length) missingInfo.push('le ou les créneau(x)');

      return missingInfo;
    },
  },
}
</script>

<style lang="stylus" scoped>
.course-link
  @media screen and (min-width: 1025px)
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: left

</style>
