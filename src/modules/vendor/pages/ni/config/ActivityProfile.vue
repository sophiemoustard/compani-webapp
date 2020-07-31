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
    <ni-modal v-model="cardCreationModal" @hide="resetCardCreationModal">
      <template slot="title">
        Créer une nouvelle <span class="text-weight-bold">carte</span>
      </template>
      <h6 class="text-weight-bold">Cours</h6>
      <div class="row q-mb-xl justify-between">
        <div v-for="template in templateTypes" :key="template.value" @click="selectTemplateInModal(template.value)"
          :class="getClassForTemplateInModal(template.value)">
          <div class="text-weight-bold card-button-content">
            <template v-if="template.value === TITLE_TEXT_MEDIA">
              <div>Titre</div>
              <div>Texte</div>
              <q-icon name="image" size="sm" />
            </template>
            <template v-else-if="template.value === TEXT_MEDIA">
              <div>Texte</div>
              <q-icon name="image" size="sm" />
            </template>
            <template v-else-if="template.value === FLASHCARD">
              <div>Flashcard</div>
              <div class="row card-button-flashcard">
                <div class="flashcard-left" />
                <div class="flashcard-right" />
              </div>
            </template>
            <template v-else>{{ formatButtonLabel(template.label) }}</template>
          </div>
        </div>
      </div>
      <template slot="footer">
        <q-btn no-caps class="full-width modal-btn" label="Créer la carte" color="primary" :loading="modalLoading"
          icon-right="add" @click="createCard" />
      </template>
    </ni-modal>
  </q-page>
</template>

<script>
import { mapState } from 'vuex';
import get from 'lodash/get';
import { required } from 'vuelidate/lib/validators';
import Activities from '@api/Activities';
import Modal from '@components/modal/Modal';
import { NotifyNegative, NotifyWarning, NotifyPositive } from '@components/popup/notify';
import { TEMPLATE_TYPES, TITLE_TEXT_MEDIA, TEXT_MEDIA, FLASHCARD } from '@data/constants';
import ProfileHeader from 'src/modules/vendor/components/ProfileHeader';
import CardContainer from 'src/modules/vendor/components/programs/CardContainer';
import CardEdition from 'src/modules/vendor/components/programs/CardEdition';

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
    'ni-modal': Modal,
  },
  data () {
    return {
      programName: '',
      stepName: '',
      modalLoading: false,
      cardCreationModal: false,
      templateTypes: TEMPLATE_TYPES,
      newCard: { template: '' },
      TITLE_TEXT_MEDIA,
      TEXT_MEDIA,
      FLASHCARD,
    };
  },
  validations () {
    return {
      newCard: { template: { required } },
    };
  },
  computed: {
    ...mapState('program', ['program', 'activity']),
    headerInfo () {
      const infos = [
        { icon: 'library_books', label: this.programName },
        { icon: 'book', label: this.stepName },
      ]

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
    getClassForTemplateInModal (template) {
      return ['card-button', 'cursor-pointer', { 'card-button-selected': this.newCard.template === template }]
    },
    selectTemplateInModal (template) {
      this.newCard.template = template;
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
    formatButtonLabel (label) {
      return label.replace(/ /g, '\n');
    },
  },
  beforeDestroy () {
    this.$store.dispatch('program/resetActivity');
    this.$store.dispatch('program/resetCard');
    if (!(new RegExp(`programs/${this.program._id}`)).test(this.$router.currentRoute.path)) {
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

h6
  margin-bottom: 3px

.q-page
  display: flex
  flex-direction: column

.body
  flex: 1

.card-button
  background-color: $light-grey
  color: $dark-grey
  border-radius: 10px
  height: 130px
  width: 100px
  @media (max-width: 767px)
      width: 65px
      height: 90px
  display: flex
  align-items: center
  justify-content: center
  margin: 10px 7px
  &-selected
    background-color: $dark-grey
    color: $light-grey
  &-content
    text-align: center
    flex-wrap: wrap
    white-space: pre-line
  &-flashcard
    justify-content: center
    & > div
      width: 40%
      height: 42px
      margin: 8px 3px
      border-radius: 3px
      @media (max-width: 767px)
        width: 30%
        height: 30px
    .flashcard-right
      background-color: $grey
    .flashcard-left
      background-color: $middle-grey
</style>
