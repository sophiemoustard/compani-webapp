<template>
  <q-page padding class="vendor-background">
    <template v-if="activity">
      <ni-profile-header :title="activity.name">
        <template v-slot:body>
          <div class="row profile-info q-pl-lg">
            <q-item v-for="info of headerInfo" class="col-md-6 col-xs-12" :key="info.icon">
              <q-item-section side><q-icon size="xs" :name="info.icon"/></q-item-section>
              <q-item-section>{{ info.label }}</q-item-section>
            </q-item>
          </div>
        </template>
      </ni-profile-header>
      <div class="row body">
        <card-container ref="cardContainer" class="col-md-3 col-sm-4 col-xs-6" @add="openCardCreationModal" />
        <card-edition />
      </div>
    </template>

    <!-- Card creation modal -->
    <card-creation-modal v-model="cardCreationModal" :card="newCard" @hide="resetCardCreationModal"
      :loading="modalLoading" @create="createCard" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import { required } from 'vuelidate/lib/validators';
import Activities from '@api/Activities';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { ACTIVITY_TYPES } from '@data/constants';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import CardContainer from 'src/modules/vendor/components/programs/cards/CardContainer';
import CardEdition from 'src/modules/vendor/components/programs/cards/CardEdition';
import CardCreationModal from 'src/modules/vendor/components/programs/cards/CardCreationModal';

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
    'card-container': CardContainer,
    'card-edition': CardEdition,
    'card-creation-modal': CardCreationModal,
  },
  data () {
    return {
      programName: '',
      stepName: '',
      modalLoading: false,
      cardCreationModal: false,
      newCard: { template: '' },
    };
  },
  validations () {
    return {
      newCard: { template: { required } },
    };
  },
  computed: {
    ...mapState('program', ['program', 'activity']),
    activityType () {
      return ACTIVITY_TYPES.find(type => type.value === this.activity.type).label || '';
    },
    headerInfo () {
      const infos = [
        { icon: 'library_books', label: this.programName },
        { icon: 'book', label: this.stepName },
        { icon: 'bookmark_border', label: this.activityType },
      ];

      return infos;
    },
  },
  async created () {
    try {
      await this.refreshActivity();

      if (!this.progam) await this.$store.dispatch('program/fetchProgram', { programId: this.programId });
      this.programName = get(this.program, 'name') || '';

      const step = this.program.steps.find(s => s._id === this.stepId);
      this.stepName = get(step, 'name') || '';
    } catch (e) {
      console.error(e);
    }
  },
  methods: {
    async refreshActivity () {
      try {
        await this.$store.dispatch('program/fetchActivity', { activityId: this.activityId });
      } catch (e) {
        console.error(e);
      }
    },
    openCardCreationModal (stepId) {
      this.cardCreationModal = true;
    },
    async createCard () {
      try {
        this.modalLoading = true;
        this.$v.newCard.$touch();
        if (this.$v.newCard.$error) return NotifyWarning('Champ(s) invalide(s)');
        await Activities.addCard(this.activityId, this.newCard);

        NotifyPositive('Carte créée.');
        this.cardCreationModal = false;

        this.$refs.cardContainer.scrollDown();

        await this.refreshActivity();
        const cardCreated = this.activity.cards[this.activity.cards.length - 1];
        this.$store.dispatch('program/fetchCard', cardCreated);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la carte.');
      } finally {
        this.modalLoading = false;
      }
    },
    resetCardCreationModal () {
      this.newCard = { template: '' };
      this.$v.newCard.$reset();
    },
  },
  beforeDestroy () {
    this.$store.dispatch('program/resetActivity');
    this.$store.dispatch('program/resetCard');
    if ((new RegExp(`programs/${this.program._id}`)).test(this.$router.currentRoute.path)) {
      this.$store.dispatch('program/fetchProgram', { programId: this.programId });
    } else {
      this.$store.dispatch('program/resetProgram');
    }
  },
}
</script>

<style lang="stylus" scoped>
.q-page
  display: flex
  flex-direction: column

.body
  flex: 1

.q-item
  padding: 0
  min-height: 0
</style>
