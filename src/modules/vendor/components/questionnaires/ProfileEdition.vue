<template>
  <q-page>
    <div class="row col-md-6">
      <ni-input v-model.trim="questionnaire.title" required-field caption="Titre" @blur="updateQuestionnaire"
        @focus="saveTmpTitle" :error="$v.questionnaire.title.$error" :disable="questionnaire.status === PUBLISHED" />
    </div>
    <div class="row body">
      <card-container ref="cardContainer" class="col-md-3 col-sm-4 col-xs-6" @add="openCardCreationModal"
        @delete-card="validateCardDeletion" :card-parent="questionnaire" @update="updateQuestionnaire" />
      <card-edition :card-parent="questionnaire" @refresh="refreshCard('questionnaire/fetchQuestionnaire',
          { questionnaireId: questionnaire._id }) " />
    </div>

      <!-- Card creation modal -->
    <card-creation-modal v-model="cardCreationModal" @submit="createCard" />
  </q-page>
</template>

<script>
import get from 'lodash/get';
import { mapState } from 'vuex';
import { required } from 'vuelidate/lib/validators';
import Questionnaires from '@api/Questionnaires';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import Input from '@components/form/Input';
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
  },
  mixins: [cardMixin],
  validations () {
    return {
      questionnaire: { title: { required } },
    };
  },
  data () {
    return {
      tmpInput: '',
      PUBLISHED,
      cardCreationModal: false,
    };
  },
  computed: {
    ...mapState('questionnaire', ['questionnaire']),
  },
  async created () {
    await this.refreshQuestionnaire();
  },
  methods: {
    async refreshQuestionnaire () {
      try {
        await this.$store.dispatch('questionnaire/fetchQuestionnaire', { questionnaireId: this.profileId });
      } catch (e) {
        console.error(e);
      }
    },
    saveTmpTitle () {
      this.tmpInput = get(this.questionnaire, 'title') || '';
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
    async updateQuestionnaire (event) {
      try {
        if (event) await Questionnaires.update(this.questionnaire._id, { cards: event });
        else {
          const title = get(this.questionnaire, 'title');
          if (this.tmpInput === title) return;
          this.$v.questionnaire.$touch();

          if (this.$v.questionnaire.$error) return NotifyWarning('Champ(s) invalide(s)');

          await Questionnaires.update(this.questionnaire._id, { title });
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
    async refreshParent () {
      await this.refreshQuestionnaire();
    },
  },
};
</script>

<style lang="stylus" scoped>
.q-page
  display: flex
  flex-direction: column

.body
  flex: 1
</style>
