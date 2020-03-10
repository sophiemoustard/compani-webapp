<template>
  <div v-if="course">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Nom" v-model.trim="course.name" @focus="saveTmp('name')" @blur="updateCourse('name')" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Courses from '@api/Courses';
import Input from '@components/form/Input';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export default {
  name: 'ProfileProgram',
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
  },
  validations () {
    return {
      course: { name: { required } },
    }
  },
  computed: {
    ...mapGetters({ course: 'course/getCourse' }),
  },
  async mounted () {
    if (!this.course) await this.refreshCourse();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.course, path)
    },
    async refreshCourse () {
      try {
        await this.$store.dispatch('course/getCourse', { courseId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    async updateCourse (path) {
      try {
        const value = get(this.course, path);
        if (this.tmpInput === value) return;
        this.$v.course.$touch();
        if (this.$v.course.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = set({}, path, value);
        await Courses.update(this.profileId, payload);
        NotifyPositive('Modification enregistrée');

        await this.refreshCourse();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification');
      } finally {
        this.tmpInput = null;
      }
    },
  },
}
</script>
