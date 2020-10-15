<template>
  <q-page padding class="vendor-background">
    <template v-if="activity">
      <ni-profile-header :title="activity.name">
        <template v-slot:body>
          <div class="row profile-info q-pl-lg">
            <q-item v-for="info of headerInfo" class="col-md-6 col-xs-12" :key="info.icon">
              <q-item-section side>
                <q-icon size="xs" :name="info.icon" :class="info.class" />
              </q-item-section>
              <q-item-section :class="info.class">{{ info.label }}</q-item-section>
            </q-item>
          </div>
        </template>
      </ni-profile-header>
      <div class="row body">
        <card-container ref="cardContainer" class="col-md-3 col-sm-4 col-xs-6" @add="openCardCreationModal"
          @delete-card="validateCardDeletion" :disable-edition="isEditionLocked"
          @unlock-edition="validateUnlockEdition" @refresh="refreshActivity" />
        <card-edition :disable-edition="isEditionLocked" />
      </div>
    </template>

    <!-- Card creation modal -->
    <card-creation-modal v-model="cardCreationModal" :card="newCard" @hide="resetCardCreationModal"
      :loading="modalLoading" @submit="createCard" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import { required } from 'vuelidate/lib/validators';
import Cards from '@api/Cards';
import Activities from '@api/Activities';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { ACTIVITY_TYPES, PUBLISHED, PUBLISHED_DOT_ACTIVE, PUBLISHED_DOT_WARNING } from '@data/constants';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import CardContainer from 'src/modules/vendor/components/programs/cards/CardContainer';
import CardEdition from 'src/modules/vendor/components/programs/cards/CardEdition';
import CardCreationModal from 'src/modules/vendor/components/programs/cards/CardCreationModal';

export default {
  name: 'ActivityProfile',
  metadata: { title: 'Fiche activité' },
  props: {
    activityId: { type: String, required: true },
    programId: { type: String, required: true },
    subProgramId: { type: String, required: true },
    stepId: { type: String, required: true },
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
      isEditionLocked: false,
      isActivityUsedInOtherStep: false,
      PUBLISHED_DOT_WARNING,
      PUBLISHED_DOT_ACTIVE,
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
    isActivityPublished () {
      return this.activity.status === PUBLISHED;
    },
    isActivityValid () {
      return this.activity.areCardsValid && this.activity.cards.length > 0;
    },
    headerInfo () {
      const infos = [
        { icon: 'library_books', label: this.programName },
        { icon: 'book', label: this.stepName },
        { icon: 'bookmark_border', label: this.activityType },
      ];

      if (this.isActivityPublished) {
        infos.push({ icon: !this.isActivityValid ? 'circle' : 'check_circle',
          label: 'Publiée',
          class: this.isActivityValid ? 'info-active' : 'info-warning' });
      }

      return infos;
    },
  },
  async created () {
    try {
      await this.refreshActivity();

      if (!this.progam) await this.$store.dispatch('program/fetchProgram', { programId: this.programId });
      this.programName = get(this.program, 'name') || '';

      const subProgram = this.program.subPrograms.find(sp => sp._id === this.subProgramId);

      const step = subProgram ? subProgram.steps.find(s => s._id === this.stepId) : '';
      this.stepName = get(step, 'name') || '';

      this.isActivityUsedInOtherStep = this.activity.steps.length > 1;
      this.isEditionLocked = this.isActivityUsedInOtherStep || this.isActivityPublished;
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
    validateUnlockEdition () {
      const programsReusingActivity = [...new Set(
        this.activity.steps
          .filter(s => s._id !== this.stepId)
          .map(s => s.subProgram.program.name)
      )];

      const usedInOtherStepMessage = this.isActivityUsedInOtherStep
        ? 'Cette activité est utilisée dans les étapes '
          + `${programsReusingActivity.length > 1 ? 'des programmes suivants' : 'du programme suivant'} : `
          + `${programsReusingActivity.join(', ')}. <br />Si tu la modifies, elle sera modifiée dans toutes ces étapes.`
          + '<br /><br />'
        : '';
      const isPublishedMessage = this.isActivityPublished
        ? 'Cette activité est publiée, tu ne pourras pas ajouter, supprimer ou changer l\'ordre des cartes'
          + '<br /><br />'
        : '';

      this.$q.dialog({
        title: 'Confirmation',
        message: `${usedInOtherStepMessage} ${isPublishedMessage}`
          + 'Es-tu sûr(e) de vouloir déverrouiller cette activité ?',
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => { this.isEditionLocked = false; NotifyPositive('Activité déverouillée.'); })
        .onCancel(() => NotifyPositive('Déverouillage annulée.'));
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
        await this.$store.dispatch('program/fetchCard', cardCreated);
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
    validateCardDeletion (cardId) {
      this.$q.dialog({
        title: 'Confirmation',
        message: 'Es-tu sûr(e) de vouloir supprimer cette carte ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.deleteCard(cardId))
        .onCancel(() => NotifyPositive('Suppression annulée.'));
    },
    async deleteCard (cardId) {
      try {
        await Cards.deleteById(cardId);
        await this.refreshActivity();
        this.$store.dispatch('program/resetCard');
        NotifyPositive('Carte supprimée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de la carte.');
      }
    },
  },
  async beforeDestroy () {
    this.$store.dispatch('program/resetActivity');
    this.$store.dispatch('program/resetCard');
    if ((new RegExp(`programs/${this.program._id}`)).test(this.$router.currentRoute.path)) {
      this.$store.dispatch('program/fetchProgram', { programId: this.programId });
      this.$store.dispatch('program/setOpenedStep', { stepId: this.stepId });
    } else {
      this.$store.dispatch('program/resetProgram');
    }
  },
};
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

.info
  &-active
    color: $accent
  &-warning
    color: $warning
</style>
