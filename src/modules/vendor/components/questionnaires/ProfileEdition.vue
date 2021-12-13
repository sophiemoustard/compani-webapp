<template>
  <div class="column">
    <div class="row justify-between">
      <div class="row body">
        <ni-input v-model.trim="questionnaire.name" required-field caption="Nom" @blur="updateQuestionnaire"
          @focus="saveTmpName" :error="$v.questionnaire.name.$error" :disable="nameLock" />
        <ni-button v-if="isQuestionnairePublished" color="copper-grey-500" :icon="lockIcon"
          @click="nameLock = !nameLock" />
      </div>
      <div class="publish-button">
        <ni-button v-if="!isQuestionnairePublished" color="primary" label="Publier" icon="vertical_align_top"
          @click="validateQuestionnairePublication" :flat="false" />
      </div>
    </div>
    <div class="row body">
      <card-container ref="cardContainer" class="col-md-3 col-sm-4 col-xs-6" @add="openCardCreationModal"
        @delete-card="validateCardDeletion" :card-parent="questionnaire" @update="updateQuestionnaire"
        :disable-edition="isEditionLocked" @unlock-edition="validateUnlockEdition" />
      <card-edition :card-parent="questionnaire" @refresh="refreshCard" :disable-edition="isEditionLocked" />
    </div>

    <card-creation-modal v-model="cardCreationModal" @submit="createCard" />
  </div>
</template>

<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import Questionnaires from '@api/Questionnaires';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import Input from '@components/form/Input';
import Button from '@components/Button';
import { PUBLISHED } from '@data/constants';
import CardContainer from 'src/modules/vendor/components/programs/cards/CardContainer';
import CardEdition from 'src/modules/vendor/components/programs/cards/CardEdition';
import CardCreationModal from 'src/modules/vendor/components/programs/cards/CardCreationModal';
import { cardMixin } from '@mixins/cardMixin';

export default {
  name: 'ProfileEdition',
  props: {
    profileId: { type: String, required: true },
  },
  components: {
    'ni-input': Input,
    'card-container': CardContainer,
    'card-edition': CardEdition,
    'card-creation-modal': CardCreationModal,
    'ni-button': Button,
  },
  mixins: [cardMixin],
  validations () {
    return {
      questionnaire: { name: { required } },
    };
  },
  data () {
    return {
      tmpInput: '',
      PUBLISHED,
      cardCreationModal: false,
      nameLock: false,
      isEditionLocked: false,
    };
  },
  computed: {
    ...mapState({
      questionnaire: state => state.questionnaire.questionnaire,
      card: state => state.card.card,
    }),
    isQuestionnairePublished () {
      return this.questionnaire.status === PUBLISHED;
    },
    isQuestionnaireValid () {
      return this.questionnaire.areCardsValid && this.questionnaire.cards.length > 0;
    },
    lockIcon () {
      return this.nameLock ? 'lock' : 'lock_open';
    },
  },
  async created () {
    await this.refreshQuestionnaire();
    this.nameLock = this.isQuestionnairePublished;
    this.isEditionLocked = this.isQuestionnairePublished;
  },
  methods: {
    async refreshQuestionnaire () {
      try {
        await this.$store.dispatch('questionnaire/fetchQuestionnaire', { questionnaireId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    async refreshCard () {
      try {
        await this.$store.dispatch('questionnaire/fetchQuestionnaire', { questionnaireId: this.questionnaire._id });
        const card = this.questionnaire.cards.find(c => c._id === this.card._id);
        this.$store.dispatch('card/fetchCard', card);
      } catch (e) {
        console.error(e);
      }
    },
    validateUnlockEdition () {
      const isPublishedMessage = this.isQuestionnairePublished
        ? 'Ce questionnaire est publié, vous ne pourrez pas ajouter, supprimer ou changer l\'ordre des cartes.'
          + '<br /><br />'
        : '';

      this.$q.dialog({
        title: 'Confirmation',
        message: `${isPublishedMessage} Êtes-vous sûr(e) de vouloir déverrouiller ce questionnaire ?`,
        html: true,
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => { this.isEditionLocked = false; NotifyPositive('Questionnaire déverrouillé.'); })
        .onCancel(() => NotifyPositive('Déverrouillage annulé.'));
    },
    saveTmpName () {
      this.tmpInput = get(this.questionnaire, 'name') || '';
    },
    async createCard (template) {
      this.$q.loading.show();
      try {
        await Questionnaires.addCard(this.questionnaire._id, { template });

        NotifyPositive('Carte créée.');
        this.cardCreationModal = false;

        this.$refs.cardContainer.scrollDown();

        await this.refreshQuestionnaire();
        const cardCreated = this.questionnaire.cards[this.questionnaire.cards.length - 1];
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
        await Questionnaires.deleteCard(cardId);
        await this.refreshQuestionnaire();
        this.$store.dispatch('card/resetCard');
        NotifyPositive('Carte supprimée');
      } catch (e) {
        console.error(e);
        NotifyNegative('Erreur lors de la suppression de la carte.');
      }
    },
    async updateQuestionnaire (event) {
      try {
        if (event) await Questionnaires.update(this.questionnaire._id, { cards: event });
        else {
          const name = get(this.questionnaire, 'name');
          if (this.tmpInput === name) return;
          this.$v.questionnaire.$touch();

          if (this.$v.questionnaire.$error) return NotifyWarning('Champ(s) invalide(s)');

          await Questionnaires.update(this.questionnaire._id, { name });
        }

        NotifyPositive('Modification enregistrée.');
      } catch (e) {
        console.error(e);
        if (event) NotifyNegative('Erreur lors de la modification des cartes.');
        else NotifyNegative('Erreur lors de la modification du questionnaire.');
      } finally {
        this.refreshQuestionnaire();
      }
    },
    async validateQuestionnairePublication () {
      if (!this.questionnaire.cards.length) return NotifyWarning('Il n\'y a aucune carte dans ce questionnaire.');
      if (!this.questionnaire.areCardsValid) return NotifyWarning('Carte(s) invalide(s).');

      this.$q.dialog({
        title: 'Confirmation',
        message: 'Êtes-vous sûr(e) de vouloir publier ce questionnaire ?',
        ok: true,
        cancel: 'Annuler',
      }).onOk(() => this.publishQuestionnaire())
        .onCancel(() => NotifyPositive('Publication annulée.'));
    },
    async publishQuestionnaire () {
      try {
        if (this.isQuestionnaireValid) {
          await Questionnaires.update(this.questionnaire._id, { status: PUBLISHED });
          this.nameLock = true;
          this.isEditionLocked = true;
          NotifyPositive('Questionnaire publié.');
        }
      } catch (e) {
        console.error(e);
        if (e.status === 409) return NotifyWarning(e.data.message);
        NotifyNegative('Erreur lors de la publication du questionnaire.');
      } finally {
        this.refreshQuestionnaire();
      }
    },
  },
  async beforeDestroy () {
    this.$store.dispatch('card/resetCard');
  },
};
</script>

<style lang="sass" scoped>
.body
  flex: 1
.publish-button
  display: flex
  height: 40px
  align-self: center
</style>
