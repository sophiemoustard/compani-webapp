<template>
  <q-page padding class="vendor-background">
    <template v-if="activity">
      <ni-profile-header :title="activity.name" :header-info="headerInfo" />
      <div class="q-mb-lg">
        <ni-button v-if="isEditionLocked" label="Déverrouiller" color="primary" icon="mdi-lock"
          @click="validateUnlockEdition" />
      </div>
      <div class="row gutter-profile">
        <ni-input v-model.trim="editedActivity.name" required-field caption="Nom"
          @blur="updateActivity(editedActivity.name, 'name')" :disable="isEditionLocked"
          :error="$v.editedActivity.name.$error" />
        <ni-select v-model.trim="editedActivity.type" @input="updateActivity(editedActivity.type, 'type')"
          :options="ACTIVITY_TYPES" caption="Type" :disable="isActivityPublished || isEditionLocked" required-field
          :error="$v.editedActivity.type.$error" />
      </div>
      <div class="row body">
        <card-container ref="cardContainer" class="col-md-3 col-sm-4 col-xs-6" @add="openCardCreationModal"
          @delete-card="validateCardDeletion" :disable-edition="isEditionLocked" :card-parent="activity"
          @update="updateActivity($event, 'cards')" />
        <card-edition :disable-edition="isEditionLocked" :card-parent="activity" @refresh="refreshCard" />
      </div>
    </template>

    <card-creation-modal v-model="cardCreationModal" @submit="createCard" />
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import get from 'lodash/get';
import uniqBy from 'lodash/uniqBy';
import Activities from '@api/Activities';
import { NotifyNegative, NotifyPositive, NotifyWarning } from '@components/popup/notify';
import { ACTIVITY_TYPES, PUBLISHED, PUBLISHED_DOT_ACTIVE, PUBLISHED_DOT_WARNING } from '@data/constants';
import ProfileHeader from '@components/ProfileHeader';
import Button from '@components/Button';
import Input from '@components/form/Input';
import Select from '@components/form/Select';
import CardContainer from 'src/modules/vendor/components/programs/cards/CardContainer';
import CardEdition from 'src/modules/vendor/components/programs/cards/CardEdition';
import CardCreationModal from 'src/modules/vendor/components/programs/cards/CardCreationModal';
import { cardMixin } from '@mixins/cardMixin';

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
    'ni-button': Button,
    'ni-input': Input,
    'ni-select': Select,
  },
  mixins: [cardMixin],
  data () {
    return {
      programName: '',
      stepName: '',
      cardCreationModal: false,
      isEditionLocked: false,
      isActivityUsedInSeveralPlaces: false,
      PUBLISHED_DOT_WARNING,
      PUBLISHED_DOT_ACTIVE,
      editedActivity: { name: '', type: '' },
      ACTIVITY_TYPES,
    };
  },
  validations () {
    return {
      editedActivity: {
        name: { required },
        type: { required },
      },
    };
  },
  computed: {
    ...mapState({
      activity: state => state.program.activity,
      program: state => state.program.program,
      card: state => state.card.card,
    }),
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

      if (!this.program) await this.$store.dispatch('program/fetchProgram', { programId: this.programId });
      this.programName = get(this.program, 'name') || '';

      const subProgram = this.program.subPrograms.find(sp => sp._id === this.subProgramId);

      const step = subProgram ? subProgram.steps.find(s => s._id === this.stepId) : '';
      this.stepName = get(step, 'name') || '';

      const isActivityUsedInOtherSteps = this.activity.steps.length > 1;
      const isActivityUsedInOneStepButSeveralSubPrograms = this.activity.steps[0].subPrograms.length > 1;
      this.isActivityUsedInSeveralPlaces = isActivityUsedInOtherSteps || isActivityUsedInOneStepButSeveralSubPrograms;

      this.isEditionLocked = this.isActivityUsedInSeveralPlaces || this.isActivityPublished;
      this.editedActivity = { name: this.activity.name, type: this.activity.type };
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
    async refreshCard () {
      try {
        await this.$store.dispatch('program/fetchActivity', { activityId: this.activity._id });
        const card = this.activity.cards.find(c => c._id === this.card._id);
        this.$store.dispatch('card/fetchCard', card);
      } catch (e) {
        console.error(e);
      }
    },
    validateUnlockEdition () {
      const activityReusagesExceptCurrentUsage = this.activity.steps
        .map(step => step.subPrograms
          .map(sp => ({
            stepId: step._id,
            subProgramId: sp._id,
            programId: get(sp, 'program._id'),
            programName: get(sp, 'program.name'),
          })))
        .flat()
        .filter(activity => activity.subProgramId !== this.subProgramId || activity.stepId !== this.stepId);
      const programsReusingActivity = uniqBy(activityReusagesExceptCurrentUsage, 'programId').map(p => p.programName);

      const usedInOtherStepMessage = this.isActivityUsedInSeveralPlaces
        ? 'Cette activité est utilisée dans les étapes '
          + `${programsReusingActivity.length > 1 ? 'des programmes suivants' : 'du programme suivant'} : `
          + `${programsReusingActivity.join(', ')}. <br />Si vous la modifiez, elle sera modifiée dans toutes
          ces étapes.`
          + '<br /><br />'
        : '';
      const isPublishedMessage = this.isActivityPublished
        ? 'Cette activité est publiée, vous ne pourrez pas ajouter, supprimer ou changer l\'ordre des cartes'
          + '<br /><br />'
        : '';

      this.$q.dialog({
        title: 'Confirmation',
        message: `${usedInOtherStepMessage} ${isPublishedMessage}`
          + 'Êtes-vous sûr(e) de vouloir déverrouiller cette activité ?',
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => { this.isEditionLocked = false; NotifyPositive('Activité déverrouillée.'); })
        .onCancel(() => NotifyPositive('Déverrouillage annulé.'));
    },
    async createCard (template) {
      this.$q.loading.show();
      try {
        await Activities.addCard(this.activityId, { template });

        NotifyPositive('Carte créée.');
        this.cardCreationModal = false;

        this.$refs.cardContainer.scrollDown();

        await this.refreshActivity();
        const cardCreated = this.activity.cards[this.activity.cards.length - 1];
        await this.$store.dispatch('card/fetchCard', cardCreated);
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la création de la carte.');
      } finally {
        this.$q.loading.hide();
      }
    },
    async deleteCard (cardId) {
      try {
        await Activities.deleteCard(cardId);
        await this.refreshActivity();
        this.$store.dispatch('card/resetCard');
        NotifyPositive('Carte supprimée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de la carte.');
      }
    },
    async updateActivity (event, path) {
      try {
        this.$v.editedActivity.$touch();
        if (this.$v.editedActivity.$error) return NotifyWarning('Champ(s) invalide(s)');
        await Activities.updateById(this.activity._id, { [path]: event });
        NotifyPositive('Modification enregistrée.');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la modification des cartes.');
      } finally {
        this.refreshActivity();
      }
    },
  },
  async beforeUnmount () {
    this.$store.dispatch('program/resetActivity');
    this.$store.dispatch('card/resetCard');
    if ((new RegExp(`programs/${this.program._id}`)).test(this.$router.currentRoute.path)) {
      this.$store.dispatch('program/fetchProgram', { programId: this.programId });
      this.$store.dispatch('program/setOpenedStep', { stepId: this.stepId });
    } else {
      this.$store.dispatch('program/resetProgram');
    }
  },
};
</script>

<style lang="sass" scoped>
.q-page
  display: flex
  flex-direction: column

.body
  flex: 1

.q-item
  padding: 0
  min-height: 0
:deep .q-btn__wrapper
  padding: 0px !important
</style>
