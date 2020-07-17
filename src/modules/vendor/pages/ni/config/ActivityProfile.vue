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
    <ni-card-container :cards="activity.cards" @openCreationModal="openCardCreationModal"/>

    <!-- Card creation modal -->
    <ni-modal v-model="cardCreationModal" @hide="resetCardCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">carte</span>
      </template>
      <ni-input in-modal v-model.trim="newCard.type" :error="$v.newCard.type.$error"
        @blur="$v.newCard.type.$touch" required-field caption="Template" />
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la carte" color="primary" :loading="modalLoading"
          icon-right="add" @click="createCard" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import get from 'lodash/get'
import { required } from 'vuelidate/lib/validators';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import CardContainer from 'src/modules/vendor/components/programs/CardContainer';
import Input from '@components/form/Input';
import Modal from '@components/modal/Modal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import Activities from '@api/Activities';
import Programs from '@api/Programs';

export default {
  name: 'ActivityProfile',
  metadata: { title: 'Fiche activité' },
  props: {
    activityId: { type: String },
    programId: { type: String },
    stepId: { type: String },
  },
  components: {
    'ni-profile-header': ProfileHeader,
    'ni-card-container': CardContainer,
    'ni-input': Input,
    'ni-modal': Modal,
  },
  data () {
    return {
      activity: {},
      programName: '',
      stepTitle: '',
      modalLoading: false,
      cardCreationModal: false,
      newCard: { type: 'transition' },
    };
  },
  validations () {
    return {
      newCard: { type: { required } },
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
    try {
      await this.refreshActivity()

      const program = await Programs.getById(this.programId);
      this.programName = get(program, 'name') || '';

      const step = program.steps.find(s => s._id === this.stepId);
      this.stepTitle = get(step, 'title') || '';
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async refreshActivity () {
      this.activity = await Activities.getById(this.activityId);
    },
    openCardCreationModal (stepId) {
      this.cardCreationModal = true;
    },
    async createCard () {
      try {
        this.modalLoading = true;
        this.$v.newCard.$touch();
        if (this.$v.newCard.$error) return NotifyWarning('Champ(s) invalide(s)');
        await Activities.addActivity(this.activityId, this.newCard);
        NotifyPositive('Carte créé.');

        this.refreshActivity();
        this.cardCreationModal = false;
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la carte.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetCardCreationModal () {
      this.newCard = { type: 'transition' };
      this.$v.newCard.$reset();
    },
  },
}
</script>

<style lang="stylus" scoped>
.q-item
  padding: 0
  min-height: 0
</style>
