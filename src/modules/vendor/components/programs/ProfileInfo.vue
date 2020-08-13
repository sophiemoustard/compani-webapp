<template>
  <div v-if="program">
    <div class="q-mb-xl">
      <p class="text-weight-bold">Informations générales</p>
      <div class="row gutter-profile">
        <ni-input caption="Nom" v-model.trim="program.name" @focus="saveTmp('name')" @blur="updateProgram('name')"
          :error="$v.program.name.$error" required-field />
      </div>
      <div class="row gutter-profile">
        <ni-input caption="Objectifs pédagogiques" v-model.trim="program.learningGoals" type="textarea"
          @focus="saveTmp('learningGoals')" @blur="updateProgram('learningGoals')" required-field
          :error="$v.program.learningGoals.$error" />
        <ni-file-uploader caption="Image" path="image" :entity="program" alt="image programme" cloudinary-storage
          :url="programsUploadUrl" @delete="validateProgramImageDeletion" @uploaded="programImageUploaded"
          :additional-value="imageFileName" label="Pas d'image" :extensions="extensions" :max-file-size="500000" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import set from 'lodash/set';
import Programs from '@api/Programs';
import Cloudinary from '@api/Cloudinary';
import Input from '@components/form/Input';
import FileUploader from '@components/form/FileUploader.vue';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';

export default {
  name: 'ProfileInfo',
  props: {
    profileId: { type: String },
  },
  components: {
    'ni-input': Input,
    'ni-file-uploader': FileUploader,
  },
  data () {
    return {
      tmpInput: '',
      extensions: 'image/jpg, image/jpeg',
    };
  },
  validations () {
    return {
      program: { name: { required }, learningGoals: { required } },
    };
  },
  computed: {
    ...mapState('program', ['program']),
    programsUploadUrl () {
      return `${process.env.API_HOSTNAME}/programs/${this.program._id}/cloudinary/upload`;
    },
    imageFileName () {
      return `Image-${this.program.name.replace(/ /g, '_')}`;
    },
  },
  async mounted () {
    if (!this.program) await this.refreshProgram();
    this.$v.program.$touch();
  },
  methods: {
    saveTmp (path) {
      this.tmpInput = get(this.program, path);
    },
    async refreshProgram () {
      try {
        await this.$store.dispatch('program/fetchProgram', { programId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    async updateProgram (path) {
      try {
        const value = get(this.program, path);
        if (this.tmpInput === value) return;
        this.$v.program.$touch();
        if (this.$v.program.$error) return NotifyWarning('Champ(s) invalide(s)');

        const payload = set({}, path, value);
        await Programs.update(this.profileId, payload);
        NotifyPositive('Modification enregistrée.');

        await this.refreshProgram();
      } catch (e) {
        console.error(e);
        if (e.message === 'Champ(s) invalide(s)') return NotifyWarning(e.message);
        NotifyNegative('Erreur lors de la modification.');
      } finally {
        this.tmpInput = null;
      }
    },
    programImageUploaded () {
      NotifyPositive('Image envoyée');
      this.refreshProgram();
    },
    validateProgramImageDeletion () {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer l\'image ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteProgramImage())
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteProgramImage () {
      try {
        if (get(this.program, 'image')) {
          await Cloudinary.deleteImageById({ id: this.program.image.publicId });
          await Programs.update(this.program._id, { image: { link: null, publicId: null } });

          this.refreshProgram();
          NotifyPositive('Image supprimée');
        } else NotifyNegative('Erreur lors de la suppression de l\'image.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de l\'image.');
      }
    },
  },
};
</script>
