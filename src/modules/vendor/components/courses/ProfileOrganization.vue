<template>
  <div v-if="course">
    <div class="q-mb-xl">
      <div class="row gutter-profile">
        <ni-input caption="Nom de la session" v-model.trim="course.name" @focus="saveTmp('name')"
          @blur="updateCourse('name')" />
        <ni-select caption="Formateur" v-model.trim="course.trainer" @focus="saveTmp('trainer')"
          @blur="updateCourse('trainer')" :options="trainerOptions" />
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
import Users from '@api/Users';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import { TRAINER } from '@data/constants';
import { formatIdentity } from '@helpers/utils';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export default {
  name: 'ProfileOrganization',
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
    'ni-select': Select,
  },
  data () {
    return {
      trainerOptions: [],
    }
  },
  validations () {
    return {
      course: {
        name: { required },
        trainer: { required },
      },
    }
  },
  computed: {
    ...mapGetters({ course: 'course/getCourse' }),
  },
  async mounted () {
    if (!this.course) await this.refreshCourse();
    await this.refreshTrainers();
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
    async refreshTrainers () {
      try {
        const trainers = await Users.list({ role: [TRAINER] });
        this.trainerOptions = trainers.map(t => ({ label: formatIdentity(t.identity, 'FL'), value: t._id }))
      } catch (e) {
        console.error(e);
      }
    },
    async updateCourse (path) {
      try {
        const value = get(this.course, path);
        if (this.tmpInput === value) return;
        this.$v.course[path].$touch();
        if (this.$v.course[path].$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = set({}, path, value);
        await Courses.update(this.profileId, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshCourse();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message)
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = null;
      }
    },
  },
}
</script>
